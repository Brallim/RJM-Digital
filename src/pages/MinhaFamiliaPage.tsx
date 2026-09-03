import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { getDefaultAvatar } from '../utils/avatar';
import { BookOpen, CalendarDays, Heart, AlertCircle } from 'lucide-react';
import type { Pessoa } from '../types';

export const MinhaFamiliaPage: React.FC = () => {
  const { usuarioAtivo, pessoas, reunioes } = useAppContext();

  // Encontra a pessoa vinculada ao usuário
  const minhaPessoa = pessoas.find(p => p.id === usuarioAtivo?.pessoaId);
  
  // Se for pai/mãe, lista os filhos. Se for jovem, lista ele mesmo e os irmãos.
  const jovensDaFamilia = useMemo(() => {
    if (!minhaPessoa) return [];
    
    return pessoas.filter(p => 
      p.familiaId === minhaPessoa.familiaId && 
      ['menino', 'menina', 'moco', 'moca'].includes(p.categoria) &&
      p.ativo
    );
  }, [minhaPessoa, pessoas]);

  // Encontra a próxima reunião planejada/preparada
  const proximaReuniao = useMemo(() => {
    return reunioes
      .filter(r => r.status === 'planejamento' || r.status === 'preparada')
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];
  }, [reunioes]);

  // Retorna o trecho da próxima reunião para a categoria da pessoa
  const getTrecho = (pessoa: Pessoa) => {
    if (!proximaReuniao) return null;
    switch (pessoa.categoria) {
      case 'menino': return proximaReuniao.trechoMeninos;
      case 'menina': return proximaReuniao.trechoMeninas;
      case 'moco': return proximaReuniao.trechoMocos;
      case 'moca': return proximaReuniao.trechoMocas;
      default: return null;
    }
  };

  if (!minhaPessoa) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center animate-in fade-in pb-24">
        <AlertCircle size={48} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-[#1e1b4b] mb-2">Sem vínculo familiar</h2>
        <p className="text-gray-500">Seu usuário ainda não foi vinculado a um morador. Peça ao cooperador para vincular o seu usuário ao seu cadastro de morador.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 pb-28 bg-[#fafafa] min-h-screen">
      
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#fff0f6] to-[#fdf2f8] rounded-3xl p-6 mb-2 overflow-hidden shadow-sm border border-pink-50">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1e1b4b] tracking-tight">Minha Família</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center">
              <Heart size={14} className="text-pink-500 mr-1.5" /> 
              Meus jovens e menores
            </p>
          </div>
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-pink-100 shrink-0">
            {getDefaultAvatar(minhaPessoa) ? (
              <img src={getDefaultAvatar(minhaPessoa)!} alt="Meu perfil" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="font-bold text-pink-500 text-xl">{minhaPessoa.nomeCompleto.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Próxima Reunião Info */}
      {proximaReuniao ? (
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-[#8b5cf6] shrink-0">
              <CalendarDays size={24} />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Próxima Reunião</p>
              <h3 className="font-bold text-[#1e1b4b] text-[14px]">
                {new Date(proximaReuniao.data).toLocaleDateString('pt-BR', { weekday: 'long' })} • {new Date(proximaReuniao.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-500">Nenhuma reunião programada.</p>
        </div>
      )}

      {/* Lista de Filhos / Recitativos */}
      {jovensDaFamilia.length > 0 ? (
        <div className="space-y-4">
          {jovensDaFamilia.map(jovem => {
            const trecho = getTrecho(jovem);
            
            // Define cor baseada na categoria
            let colorTheme = 'pink';
            if (jovem.categoria === 'menino') colorTheme = 'blue';
            if (jovem.categoria === 'moca') colorTheme = 'purple';
            if (jovem.categoria === 'moco') colorTheme = 'emerald';

            const bgMap: Record<string, string> = {
              'pink': 'bg-[#fff0f6] border-pink-100 text-pink-600',
              'blue': 'bg-[#f0f9ff] border-blue-100 text-blue-600',
              'purple': 'bg-[#f5f3ff] border-purple-100 text-purple-600',
              'emerald': 'bg-[#ecfdf5] border-emerald-100 text-emerald-600',
            };

            const headerMap: Record<string, string> = {
              'pink': 'bg-pink-500',
              'blue': 'bg-blue-500',
              'purple': 'bg-purple-500',
              'emerald': 'bg-emerald-500',
            };

            const labelMap: Record<string, string> = {
              'menino': 'Menino',
              'menina': 'Menina',
              'moco': 'Moço',
              'moca': 'Moça',
              'adulto': 'Adulto'
            };

            return (
              <div key={jovem.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                {/* Faixa superior com a cor */}
                <div className={`h-2 w-full ${headerMap[colorTheme]}`}></div>
                
                <div className="p-5">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm shrink-0">
                      <img src={getDefaultAvatar(jovem)!} alt={jovem.nomeCompleto} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e1b4b] text-[16px] leading-tight mb-1">{jovem.nomeCompleto}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${bgMap[colorTheme]}`}>
                        {labelMap[jovem.categoria] || jovem.categoria}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen size={16} className="text-gray-500" />
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Recitativo a decorar</span>
                    </div>
                    
                    {trecho ? (
                      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm text-center">
                        <p className="text-[18px] font-black text-[#1e1b4b]">{trecho}</p>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-[13px] text-gray-400 font-medium">Ainda não definido para esta reunião.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[24px] p-8 text-center border border-gray-100 shadow-sm">
          <Heart className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="text-[#1e1b4b] font-bold mb-1">Nenhum jovem ou menor</h3>
          <p className="text-sm text-gray-500">Sua família não possui jovens ou menores cadastrados no momento.</p>
        </div>
      )}

    </div>
  );
};
