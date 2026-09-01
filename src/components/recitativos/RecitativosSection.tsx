import React, { useState } from 'react';
import { BookOpen, Calendar, Plus, Clock, Check, X as XIcon, Edit2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { reuniaoService } from '../../services/reuniaoService';
import { frequenciaService } from '../../services/frequenciaService';
import { ReuniaoFormModal } from './ReuniaoFormModal';
import type { Reuniao } from '../../types';

export const RecitativosSection: React.FC = () => {
  const { usuarioAtivo, comunidadeAtiva, pessoas, reunioes } = useAppContext();
  const [showReuniaoForm, setShowReuniaoForm] = useState(false);
  const [reuniaoToEdit, setReuniaoToEdit] = useState<Reuniao | null>(null);
  const [selectedReuniaoId, setSelectedReuniaoId] = useState<string | null>(null);
  const [ausentes, setAusentes] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const reunioesDaComunidade = reunioes
    .filter(r => r.comunidadeId === comunidadeAtiva?.id)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  React.useEffect(() => {
    if (reunioesDaComunidade.length > 0 && !selectedReuniaoId) {
      // Find the first future/today meeting, or fallback to the latest
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const future = reunioesDaComunidade.find(r => new Date(r.data).getTime() >= now.getTime());
      setSelectedReuniaoId(future ? future.id : reunioesDaComunidade[reunioesDaComunidade.length - 1].id);
    }
  }, [reunioesDaComunidade, selectedReuniaoId]);

  const reuniaoAtual = reunioesDaComunidade.find(r => r.id === selectedReuniaoId) || reunioesDaComunidade[0];

  React.useEffect(() => {
    if (reuniaoAtual?.id) {
      frequenciaService.getFrequenciasDaReuniao(reuniaoAtual.id).then(frequencias => {
        // Mapeia quem está ausente (presente === false)
        const ausentesDb = frequencias.filter(f => !f.presente).map(f => f.pessoaId);
        setAusentes(ausentesDb);
      });
    }
  }, [reuniaoAtual?.id]);

  const togglePresenca = async (pessoaId: string) => {
    if (!reuniaoAtual || isUpdating) return;
    
    setIsUpdating(true);
    const isCurrentlyAusente = ausentes.includes(pessoaId);
    const willBeAusente = !isCurrentlyAusente;
    
    // Atualiza a interface instantaneamente (optimistic update)
    setAusentes(prev => 
      willBeAusente ? [...prev, pessoaId] : prev.filter(id => id !== pessoaId)
    );
    
    try {
      // Salva no banco de dados (o valor "presente" é o inverso do "willBeAusente")
      await frequenciaService.upsertFrequencia(reuniaoAtual.id, pessoaId, !willBeAusente);
    } catch (err) {
      console.error('Erro ao salvar presença', err);
      // Em caso de erro, reverte a interface
      setAusentes(prev => 
        isCurrentlyAusente ? [...prev, pessoaId] : prev.filter(id => id !== pessoaId)
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Identifica a pessoa atrelada ao usuário ativo
  const minhaPessoa = pessoas.find(p => p.id === usuarioAtivo?.pessoaId);

  // Função para filtrar os jovens que devem aparecer na lista baseada no perfil
  const filterParticipantes = (categoria: string) => {
    let list = pessoas.filter(j => j.categoria === categoria && j.comunidadeId === comunidadeAtiva?.id);

    if (usuarioAtivo?.perfil === 'jovem') {
      return list.filter(j => j.id === usuarioAtivo.pessoaId);
    }
    if (usuarioAtivo?.perfil === 'pai') {
      if (!minhaPessoa) return [];
      return list.filter(j => j.familiaId === minhaPessoa.familiaId);
    }
    
    // cooperador e auxiliar veem todos
    return list;
  };

  const continuacoes = [
    {
      id: 1, name: 'Meninas', colorClass: 'text-[#ff007f]', bgClass: 'bg-[#fff0f6]', borderClass: 'border-pink-100',
      responsavel: reuniaoAtual?.auxiliarMeninas || 'Não definido', trecho: reuniaoAtual?.trechoMeninas || 'Não definido',
      texto: '',
      participantes: filterParticipantes('menina'),
      badgeClass: 'bg-[#ff007f]'
    },
    {
      id: 2, name: 'Moças', colorClass: 'text-[#7c3aed]', bgClass: 'bg-[#f5f3ff]', borderClass: 'border-purple-100',
      responsavel: reuniaoAtual?.auxiliarMocas || 'Não definido', trecho: reuniaoAtual?.trechoMocas || 'Não definido',
      texto: '',
      participantes: filterParticipantes('moca'),
      badgeClass: 'bg-[#7c3aed]'
    },
    {
      id: 3, name: 'Meninos', colorClass: 'text-[#0ea5e9]', bgClass: 'bg-[#f0f9ff]', borderClass: 'border-blue-100',
      responsavel: reuniaoAtual?.auxiliarMeninos || 'Não definido', trecho: reuniaoAtual?.trechoMeninos || 'Não definido',
      texto: '',
      participantes: filterParticipantes('menino'),
      badgeClass: 'bg-[#0ea5e9]'
    },
    {
      id: 4, name: 'Moços', colorClass: 'text-[#10b981]', bgClass: 'bg-[#ecfdf5]', borderClass: 'border-emerald-100',
      responsavel: reuniaoAtual?.auxiliarMocos || 'Não definido', trecho: reuniaoAtual?.trechoMocos || 'Não definido',
      texto: '',
      participantes: filterParticipantes('moco'),
      badgeClass: 'bg-[#10b981]'
    }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const dataFormatada = reuniaoAtual 
    ? new Date(reuniaoAtual.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    : '';
  const horaFormatada = reuniaoAtual
    ? new Date(reuniaoAtual.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="space-y-6 pt-4 border-t border-gray-100 mt-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-[#1e1b4b]">
          <BookOpen size={24} className="text-[#8b5cf6]" />
          <h2 className="text-xl font-bold">Recitativos</h2>
        </div>
        {usuarioAtivo?.perfil === 'cooperador' && (
          <button 
            onClick={() => {
              setReuniaoToEdit(null);
              setShowReuniaoForm(true);
            }}
            className="bg-[#10b981] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center shadow-sm"
          >
            <Plus size={14} className="mr-1" /> Nova Reunião
          </button>
        )}
      </header>

      {/* Tabs */}
      {reunioesDaComunidade.length > 0 && (
        <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
          {reunioesDaComunidade.map(r => {
            const date = new Date(r.data);
            const isSelected = r.id === reuniaoAtual?.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedReuniaoId(r.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${isSelected ? 'bg-[#10b981] text-white border-[#10b981] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}
              </button>
            );
          })}
        </div>
      )}

      {/* Próxima Reunião Card */}
      {reuniaoAtual ? (
        <div className="bg-white rounded-[24px] border border-[#f3f4f6] shadow-sm p-4 mb-6 relative">
          {usuarioAtivo?.perfil === 'cooperador' && (
            <button 
              onClick={() => {
                setReuniaoToEdit(reuniaoAtual);
                setShowReuniaoForm(true);
              }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-[#8b5cf6] bg-gray-50 p-2 rounded-xl transition-colors shadow-sm border border-gray-100"
              title="Editar Reunião"
            >
              <Edit2 size={16} />
            </button>
          )}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3 pr-12">
            <div>
              <p className="text-xs font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">Próxima Reunião</p>
              <div className="flex items-center space-x-3 text-[#1e1b4b]">
                <div className="flex items-center font-bold">
                  <Calendar size={16} className="mr-1.5 text-gray-400" />
                  <span className="capitalize">{dataFormatada}</span>
                </div>
                <div className="flex items-center font-bold">
                  <Clock size={16} className="mr-1.5 text-gray-400" />
                  <span>{horaFormatada}</span>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 text-[#8b5cf6] px-3 py-1.5 rounded-full text-[11px] font-bold capitalize whitespace-nowrap">
              {reuniaoAtual.status.replace('_', ' ')}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pai Nosso</p>
              <p className="text-sm font-bold text-[#1e1b4b] truncate">{reuniaoAtual.oracaoPaiNosso || 'A definir'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Oração Espontânea</p>
              <p className="text-sm font-bold text-[#1e1b4b] truncate">{reuniaoAtual.oracaoEspontanea || 'A definir'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center mb-6">
          <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 font-medium mb-3">Nenhuma reunião agendada para esta congregação.</p>
          {usuarioAtivo?.perfil === 'cooperador' && (
            <button 
              onClick={() => setShowReuniaoForm(true)}
              className="bg-[#f5f3ff] text-[#8b5cf6] font-bold py-2 px-4 rounded-xl text-xs inline-flex items-center"
            >
              <Plus size={14} className="mr-1" /> Agendar primeira reunião
            </button>
          )}
        </div>
      )}

      {/* Lista de Versos a Recitar */}
      {reuniaoAtual && (
        <div className="space-y-4">
        {continuacoes.map(c => (
          <div key={`lista-${c.id}`} className="bg-white rounded-[24px] border border-[#f3f4f6] shadow-sm overflow-hidden mb-4">
              
              {/* Card Header */}
              <div className={`${c.bgClass} px-5 py-3.5 flex items-center border-b border-[#f3f4f6] flex-wrap gap-y-2`}>
                <div className="flex items-center">
                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[13px] font-bold text-white ${c.badgeClass} shrink-0 mr-2`}>
                    {c.id}
                  </div>
                  <h3 className={`font-bold ${c.colorClass} text-[17px]`}>{c.name}</h3>
                </div>
                <div className="flex items-center flex-wrap">
                  <span className={`${c.colorClass} text-[10px] font-black opacity-60 mx-2`}>•</span>
                  <span className={`${c.colorClass} text-[13px] font-medium`}>Auxiliar responsável: {c.responsavel}</span>
                  <span className={`${c.colorClass} text-[10px] font-black opacity-60 mx-2`}>•</span>
                  <span className={`${c.colorClass} text-[13px] font-bold`}>{c.trecho.split(':')[0]}</span>
                </div>
              </div>
              
              {/* Participants List */}
              <div className="divide-y divide-[#f3f4f6]">
                {c.participantes.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <p className="text-[13px] text-gray-400 font-medium">Nenhum recitativo agendado para esta categoria.</p>
                  </div>
                ) : (
                  c.participantes.map((participante, idx) => (
                    <div key={participante.id} className="px-5 py-3 flex items-center space-x-3 bg-white">
                      {/* Circle Number */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${c.badgeClass} shrink-0`}>
                        {idx + 1}
                      </div>
                      
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                        <img 
                          src={participante.fotoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${participante.nomeCompleto}`} 
                          alt="avatar" 
                          className={`w-full h-full object-cover ${!participante.fotoUrl ? 'scale-110' : ''}`} 
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-[#1e1b4b] text-[15px] truncate">{participante.nomeCompleto}</p>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <Calendar size={13} className="text-[#5468ff]" />
                          <span className="text-[12px] font-semibold text-[#5468ff]">{formatDate(participante.dataNascimento)}</span>
                        </div>
                      </div>
                      
                      {/* Verse */}
                      <div className="text-left flex-1 border-l border-[#f3f4f6] pl-4 pr-1 min-w-[110px]">
                        <p className="text-[11px] text-[#5468ff] font-medium leading-tight">Verso a recitar</p>
                        <p className="font-bold text-[#1e1b4b] text-[15px] leading-tight mt-0.5">{c.trecho}</p>
                        <p className="text-[11px] text-[#5468ff] font-medium leading-tight mt-0.5">Verso {idx + 1}</p>
                      </div>

                      {/* Presença Toggle */}
                      <div className="flex flex-col items-center justify-center shrink-0 pl-2">
                        <button 
                          onClick={() => togglePresenca(participante.id)}
                          className={`w-11 h-6 rounded-full relative transition-colors shadow-inner flex items-center ${ausentes.includes(participante.id) ? 'bg-red-100 border border-red-200' : 'bg-emerald-100 border border-emerald-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full absolute top-[3px] transition-transform flex items-center justify-center shadow-sm ${ausentes.includes(participante.id) ? 'left-1 bg-red-500' : 'left-6 bg-emerald-500'}`}>
                             {ausentes.includes(participante.id) ? <XIcon size={10} className="text-white" /> : <Check size={10} className="text-white" />}
                          </div>
                        </button>
                        <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${ausentes.includes(participante.id) ? 'text-red-500' : 'text-emerald-600'}`}>
                          {ausentes.includes(participante.id) ? 'Faltou' : 'Presente'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
            </div>
        ))}
        </div>
      )}
      {/* Modal */}
      {showReuniaoForm && comunidadeAtiva && (
        <ReuniaoFormModal
          comunidadeId={comunidadeAtiva.id}
          initialData={reuniaoToEdit || undefined}
          onClose={() => {
            setShowReuniaoForm(false);
            setReuniaoToEdit(null);
          }}
          onSave={async (reuniaoData: any) => {
            if (reuniaoToEdit?.id) {
              await reuniaoService.update(reuniaoToEdit.id, reuniaoData);
            } else {
              await reuniaoService.create(reuniaoData);
            }
            setShowReuniaoForm(false);
            setReuniaoToEdit(null);
            // Refresh na página para forçar a busca da nova reunião
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};
