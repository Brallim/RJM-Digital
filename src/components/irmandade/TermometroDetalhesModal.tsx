import React, { useMemo } from 'react';
import { X, CalendarDays, Home as HomeIcon } from 'lucide-react';
import type { Pessoa } from '../../types';
import { termometroConfig } from '../../config/termometroConfig';

interface TermometroDetalhesModalProps {
  pessoa: Pessoa;
  nivelAtual: { nivel: number; maxPontos: number; nome: string };
  detalhes: { presencas: number; visitas: number };
  pontos: number;
  isMenina: boolean;
  onClose: () => void;
}

export const TermometroDetalhesModal: React.FC<TermometroDetalhesModalProps> = ({ 
  nivelAtual, detalhes, pontos, isMenina, onClose 
}) => {

  const textColor = isMenina ? 'text-pink-600' : 'text-blue-600';
  const bgColor = isMenina ? 'bg-pink-50' : 'bg-blue-50';
  const buttonBg = isMenina ? 'bg-pink-500' : 'bg-blue-500';

  const mensagemSorteada = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * termometroConfig.mensagensIncentivo.length);
    return termometroConfig.mensagensIncentivo[randomIndex];
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 z-[150] flex flex-col justify-end">
      <div className="bg-[#fafafa] w-full max-h-[85%] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="bg-white px-5 pt-6 pb-4 rounded-t-3xl border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-[#1e1b4b]">Termômetro Espiritual</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          
          <div className={`${bgColor} rounded-3xl p-6 text-center mb-6`}>
            <h3 className={`text-2xl font-black ${textColor} mb-2`}>Nível {nivelAtual.nivel}</h3>
            <p className={`text-sm font-bold ${textColor}`}>{nivelAtual.nome}</p>
            <p className="text-gray-600 text-sm mt-4 italic font-medium">"{mensagemSorteada}"</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-50">
              <h4 className="font-bold text-[#1e1b4b] text-sm text-center">Participações Recentes</h4>
              <p className="text-[10px] text-gray-400 text-center mt-1">Últimos {termometroConfig.diasJanelaCalculo} dias</p>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className={`p-2 rounded-xl ${bgColor} ${textColor}`}>
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1e1b4b]">Presenças em Reunião</p>
                    <p className="text-[11px] text-gray-400">{termometroConfig.pesos.presencaReuniao} pontos por presença</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#1e1b4b]">{detalhes.presencas}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className={`p-2 rounded-xl ${bgColor} ${textColor}`}>
                    <HomeIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1e1b4b]">Visitas da Irmandade</p>
                    <p className="text-[11px] text-gray-400">{termometroConfig.pesos.participacaoVisita} ponto por visita</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-[#1e1b4b]">{detalhes.visitas}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-100">
              <span className="text-sm font-bold text-gray-500">Pontuação Total:</span>
              <span className="text-xl font-black text-[#1e1b4b]">{pontos}</span>
            </div>
          </div>

          <div className="text-center px-4">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              O Termômetro Espiritual é um indicador de constância e participação. Ele não mede a fé, mas incentiva a estar sempre presente nas coisas de Deus.
            </p>
          </div>

        </div>

        <div className="bg-white p-4 border-t border-gray-100 shrink-0">
          <button 
            onClick={onClose}
            className={`w-full ${buttonBg} text-white rounded-2xl py-3.5 font-bold flex items-center justify-center shadow-md active:scale-[0.98] transition-transform`}
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
