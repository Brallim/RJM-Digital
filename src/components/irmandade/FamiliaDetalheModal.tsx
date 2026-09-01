import React, { useState } from 'react';
import { X, MapPin, Phone, User, CalendarDays, Plus, Edit2 } from 'lucide-react';
import type { Familia, Pessoa } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { PessoaFormModal } from './forms/PessoaFormModal';
import { pessoaService } from '../../services/pessoaService';

interface FamiliaDetalheModalProps {
  familia: Familia;
  onClose: () => void;
  onNovaVisita: () => void;
  onEdit: () => void;
}

export const FamiliaDetalheModal: React.FC<FamiliaDetalheModalProps> = ({ familia, onClose, onNovaVisita, onEdit }) => {
  const { pessoas, visitas: allVisitas } = useAppContext();
  const [activeTab, setActiveTab] = useState<'moradores' | 'visitas'>('moradores');
  const [showPessoaForm, setShowPessoaForm] = useState(false);
  const [pessoaParaEditar, setPessoaParaEditar] = useState<Pessoa | undefined>(undefined);
  
  const moradores = pessoas.filter(p => p.familiaId === familia.id);
  const visitas = allVisitas.filter(v => v.familiaId === familia.id).sort((a, b) => new Date(b.dataVisita).getTime() - new Date(a.dataVisita).getTime());

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex flex-col justify-end">
      <div className="bg-[#fafafa] w-full h-[90%] rounded-t-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="bg-white px-5 pt-6 pb-4 rounded-t-3xl border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex-1 mr-4">
            {familia.fotoFamiliaUrl && (
              <img src={familia.fotoFamiliaUrl} alt="Família" className="w-full h-32 object-cover rounded-2xl mb-3 border border-gray-100" />
            )}
            <h2 className="text-xl font-bold text-[#1e1b4b]">{familia.nomeFamilia}</h2>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MapPin size={12} className="mr-1 text-[#8b5cf6]" />
              <span>{familia.endereco}, {familia.numero} - {familia.bairro}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Phone size={12} className="mr-1 text-gray-400" />
              <span>{familia.telefonePrincipal || familia.telefone}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button onClick={onEdit} className="p-2 bg-purple-50 rounded-full text-[#8b5cf6]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white px-4 border-b border-gray-100 shrink-0">
          <button 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'moradores' ? 'border-[#8b5cf6] text-[#8b5cf6]' : 'border-transparent text-gray-400'}`}
            onClick={() => setActiveTab('moradores')}
          >
            Moradores ({moradores.length})
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'visitas' ? 'border-[#8b5cf6] text-[#8b5cf6]' : 'border-transparent text-gray-400'}`}
            onClick={() => setActiveTab('visitas')}
          >
            Visitas ({visitas.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {activeTab === 'moradores' && (
            <>
              {moradores.map(m => (
                <div key={m.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-3">
                  {m.fotoUrl ? (
                    <img src={m.fotoUrl} alt={m.nomeCompleto} className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 bg-[#f5f3ff] rounded-full flex items-center justify-center text-[#8b5cf6] shrink-0">
                      <User size={20} />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-[#1e1b4b] text-sm">{m.nomeCompleto}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{m.parentesco || m.categoria}</span>
                        <button 
                          onClick={() => {
                            setPessoaParaEditar(m);
                            setShowPessoaForm(true);
                          }}
                          className="p-1 text-gray-400 hover:text-[#8b5cf6] transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 flex flex-col space-y-0.5">
                      {m.batizado ? (
                        <span className="text-[#10b981] font-semibold">Batizado(a) em {m.dataBatismo ? new Date(m.dataBatismo).toLocaleDateString('pt-BR') : '-'}</span>
                      ) : (
                        <span>Não batizado(a)</span>
                      )}
                      <span>Categoria: {m.categoria} {m.isAuxiliar ? '• Auxiliar' : ''} {m.isOrganista ? '• Organista' : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  setPessoaParaEditar(undefined);
                  setShowPessoaForm(true);
                }}
                className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 flex flex-col items-center justify-center text-gray-400 active:bg-gray-50"
              >
                <Plus size={20} className="mb-1" />
                <span className="text-xs font-bold">Adicionar morador</span>
              </button>
            </>
          )}

          {activeTab === 'visitas' && (
            <>
              <button 
                onClick={onNovaVisita}
                className="w-full bg-[#10b981] text-white rounded-2xl py-3.5 mb-4 font-bold flex items-center justify-center shadow-sm"
              >
                <Plus size={18} className="mr-2" /> Registrar nova visita
              </button>
              
              <div className="space-y-4 border-l-2 border-gray-100 ml-4 pl-4 pt-2">
                {visitas.map(v => (
                  <div key={v.id} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 bg-[#10b981] rounded-full border-2 border-white shadow-sm" />
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center text-[#8b5cf6] text-xs font-bold mb-2">
                        <CalendarDays size={12} className="mr-1" />
                        {new Date(v.dataVisita).toLocaleDateString('pt-BR')}
                      </div>
                      <p className="text-xs font-bold text-[#1e1b4b] mb-1">
                        Visitantes: <span className="font-normal text-gray-600">{v.visitantes?.join(', ')}</span>
                      </p>
                      {v.moradoresPresentes && v.moradoresPresentes.length > 0 && (
                        <p className="text-xs font-bold text-[#1e1b4b] mb-1">
                          Presentes: <span className="font-normal text-gray-600">{v.moradoresPresentes?.join(', ')}</span>
                        </p>
                      )}
                      {v.observacoes && (
                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg italic">
                          "{v.observacoes}"
                        </p>
                      )}
                      {v.fotoVisitaUrl && (
                        <div className="mt-3">
                          <img src={v.fotoVisitaUrl} alt="Selfie da Visita" className="w-full h-32 object-cover rounded-xl" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {visitas.length === 0 && (
                  <div className="text-xs text-gray-400 italic">Nenhum registro de visita encontrado.</div>
                )}
              </div>
            </>
          )}
          
        </div>
      </div>
      
      {showPessoaForm && (
        <PessoaFormModal 
          familiaId={familia.id}
          comunidadeId={familia.comunidadeId}
          initialData={pessoaParaEditar}
          onClose={() => {
            setShowPessoaForm(false);
            setPessoaParaEditar(undefined);
          }}
          onSave={async (pessoa) => {
            if (pessoa.id) {
              await pessoaService.update(pessoa.id, pessoa);
            } else {
              await pessoaService.create(pessoa);
            }
            setShowPessoaForm(false);
          }}
        />
      )}
    </div>
  );
};
