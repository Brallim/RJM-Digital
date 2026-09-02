import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { frequenciaService } from '../../services/frequenciaService';
import { termometroConfig } from '../../config/termometroConfig';
import type { Pessoa } from '../../types';
import { TermometroDetalhesModal } from './TermometroDetalhesModal';

interface TermometroEspiritualProps {
  pessoa: Pessoa;
}

export const TermometroEspiritual: React.FC<TermometroEspiritualProps> = ({ pessoa }) => {
  const { visitas, reunioes } = useAppContext();
  const [pontos, setPontos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [detalhes, setDetalhes] = useState({ presencas: 0, visitas: 0 });

  useEffect(() => {
    calcularPontuacao();
  }, [pessoa.id, visitas]);

  const calcularPontuacao = async () => {
    setLoading(true);
    try {
      // 1. Calcular Presenças em Reuniões (últimos 90 dias)
      const frequencias = await frequenciaService.getFrequenciasDePessoa(pessoa.id);
      const noventaDiasAtras = new Date();
      noventaDiasAtras.setDate(noventaDiasAtras.getDate() - termometroConfig.diasJanelaCalculo);
      
      const presencasValidas = frequencias.filter(f => {
        if (!f.presente) return false;
        const reuniao = reunioes.find(r => r.id === f.reuniaoId);
        if (!reuniao) return false;
        return new Date(reuniao.data) >= noventaDiasAtras;
      });

      // 2. Calcular Visitas (onde a pessoa estava presente)
      const visitasDaFamilia = visitas.filter(v => 
        v.familiaId === pessoa.familiaId && 
        new Date(v.dataVisita) >= noventaDiasAtras
      );
      
      const visitasValidas = visitasDaFamilia.filter(v => {
        if (!v.moradoresPresentes) return false;
        // Check if user's name is in the list of present residents (case insensitive)
        const nomePessoa = pessoa.nomeCompleto.toLowerCase();
        return v.moradoresPresentes.some(nome => 
          nomePessoa.includes(nome.toLowerCase()) || 
          nome.toLowerCase().includes(nomePessoa)
        );
      });

      const totalPresencas = presencasValidas.length;
      const totalVisitas = visitasValidas.length;
      
      const score = (totalPresencas * termometroConfig.pesos.presencaReuniao) + 
                    (totalVisitas * termometroConfig.pesos.participacaoVisita);
      
      setPontos(score);
      setDetalhes({ presencas: totalPresencas, visitas: totalVisitas });
    } catch (error) {
      console.error("Erro ao calcular termômetro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!termometroConfig.categoriasElegiveis.includes(pessoa.categoria)) {
    return null; // Não exibe para adultos ou crianças fora da categoria
  }

  // Determinar Nível
  let nivelAtualObj = termometroConfig.niveis[0];
  let nivelAnteriorMax = 0;
  
  for (let i = 0; i < termometroConfig.niveis.length; i++) {
    if (pontos <= termometroConfig.niveis[i].maxPontos) {
      nivelAtualObj = termometroConfig.niveis[i];
      nivelAnteriorMax = i > 0 ? termometroConfig.niveis[i-1].maxPontos : 0;
      break;
    }
  }

  // Se passou de todos os níveis (ex: pontos > 20)
  if (pontos > termometroConfig.niveis[termometroConfig.niveis.length - 2].maxPontos) {
    nivelAtualObj = termometroConfig.niveis[termometroConfig.niveis.length - 1];
    nivelAnteriorMax = termometroConfig.niveis[termometroConfig.niveis.length - 2].maxPontos;
  }

  // Calcular percentual dentro do nível
  const pontosNoNivel = pontos - nivelAnteriorMax;
  const rangeDoNivel = nivelAtualObj.maxPontos - nivelAnteriorMax;
  const percentual = nivelAtualObj.nivel === 5 
    ? 100 
    : Math.min(100, Math.max(0, Math.round((pontosNoNivel / rangeDoNivel) * 100)));

  // Cores
  const isMenina = pessoa.categoria === 'menina' || pessoa.categoria === 'moca';
  const bgColor = isMenina ? 'bg-pink-50' : 'bg-blue-50';
  const borderColor = isMenina ? 'border-pink-100' : 'border-blue-100';
  const progressBg = isMenina ? 'bg-pink-300' : 'bg-blue-300';
  const progressTrack = isMenina ? 'bg-pink-100' : 'bg-blue-100';
  const textColor = isMenina ? 'text-pink-600' : 'text-blue-600';
  const avatarFallback = isMenina ? 'bg-pink-200 text-pink-600' : 'bg-blue-200 text-blue-600';

  // Opacidade da chama baseada no nível (Nível 1 = 0.4 ... Nível 5 = 1)
  const flameOpacity = 0.2 + (nivelAtualObj.nivel * 0.16);
  // Tamanho da chama
  const flameScale = 0.7 + (nivelAtualObj.nivel * 0.08);

  if (loading) {
    return <div className="h-32 bg-gray-50 rounded-3xl animate-pulse"></div>;
  }

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className={`${bgColor} border ${borderColor} rounded-[28px] p-5 shadow-sm relative overflow-hidden cursor-pointer transition-transform active:scale-[0.98]`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Foto */}
            <div className={`w-14 h-14 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center ${avatarFallback}`}>
              {pessoa.fotoUrl ? (
                <img src={pessoa.fotoUrl} alt={pessoa.nomeCompleto} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-lg">{pessoa.nomeCompleto.charAt(0)}</span>
              )}
            </div>
            
            {/* Info Básica */}
            <div>
              <h3 className="font-bold text-[#1e1b4b] text-[15px] leading-tight">{pessoa.nomeCompleto}</h3>
              <p className={`text-[11px] font-bold ${textColor} mt-0.5`}>{pessoa.categoria.toUpperCase()}</p>
            </div>
          </div>

          {/* Símbolo Chama / Casa de Oração (Simples) */}
          <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
            {/* Chama SVG */}
            <svg 
              viewBox="0 0 24 24" 
              className={`w-10 h-10 transition-all duration-700 ease-in-out ${textColor}`}
              style={{ opacity: flameOpacity, transform: `scale(${flameScale})` }}
              fill="currentColor"
            >
              <path d="M12 2C12 2 5 9.5 5 14C5 17.866 8.13401 21 12 21C15.866 21 19 17.866 19 14C19 9.5 12 2 12 2ZM12 19C9.23858 19 7 16.7614 7 14C7 11.5 10 6.5 12 4.5C14 6.5 17 11.5 17 14C17 16.7614 14.7615 19 12 19Z" />
              {nivelAtualObj.nivel >= 3 && (
                <path d="M12 17C10.3431 17 9 15.6569 9 14C9 12.5 11 9 12 7.5C13 9 15 12.5 15 14C15 15.6569 13.6569 17 12 17Z" />
              )}
              {nivelAtualObj.nivel >= 5 && (
                <path d="M12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13C13 13.5523 12.5523 14 12 14Z" fill="currentColor"/>
              )}
            </svg>
          </div>
        </div>

        {/* Nível e Progresso */}
        <div className="mt-2">
          <div className="flex justify-between items-end mb-1.5">
            <div>
              <p className="text-[10px] text-gray-500 font-medium">Termômetro Espiritual</p>
              <h4 className={`font-bold text-[14px] ${textColor}`}>{nivelAtualObj.nome} (Nível {nivelAtualObj.nivel})</h4>
            </div>
            <span className={`text-[12px] font-bold ${textColor}`}>{percentual}%</span>
          </div>
          
          <div className={`w-full h-2.5 rounded-full ${progressTrack} overflow-hidden`}>
            <div 
              className={`h-full ${progressBg} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${percentual}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Baseado em {detalhes.presencas + detalhes.visitas} participações (últimos {termometroConfig.diasJanelaCalculo} dias)
          </p>
        </div>
      </div>

      {showModal && (
        <TermometroDetalhesModal 
          pessoa={pessoa}
          nivelAtual={nivelAtualObj}
          detalhes={detalhes}
          pontos={pontos}
          isMenina={isMenina}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
