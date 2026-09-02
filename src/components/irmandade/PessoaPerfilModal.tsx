import React from 'react';
import { X, Edit2, User, Phone, MapPin, CalendarDays, Droplets } from 'lucide-react';
import type { Pessoa, Familia } from '../../types';
import { TermometroEspiritual } from './TermometroEspiritual';

interface PessoaPerfilModalProps {
  pessoa: Pessoa;
  familia?: Familia;
  onClose: () => void;
  onEdit: () => void;
}

export const PessoaPerfilModal: React.FC<PessoaPerfilModalProps> = ({ pessoa, familia, onClose, onEdit }) => {
  const isMenina = pessoa.categoria === 'menina' || pessoa.categoria === 'moca';
  const isMenino = pessoa.categoria === 'menino' || pessoa.categoria === 'moco';
  
  // Theme coloring for youth, fallback to purple for adults
  let themeColor = 'text-[#8b5cf6]';
  let themeBg = 'bg-[#f5f3ff]';
  
  if (isMenina) {
    themeColor = 'text-pink-600';
    themeBg = 'bg-pink-50';
  } else if (isMenino) {
    themeColor = 'text-blue-600';
    themeBg = 'bg-blue-50';
  }

  const dataNascimento = pessoa.dataNascimento ? new Date(pessoa.dataNascimento) : null;
  const idade = dataNascimento ? new Date().getFullYear() - dataNascimento.getFullYear() : null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[110] flex flex-col justify-end">
      <div className="bg-[#fafafa] w-full h-[95%] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="bg-white px-5 pt-6 pb-4 rounded-t-3xl border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-[#1e1b4b]">Perfil</h2>
          <div className="flex items-center space-x-2">
            <button onClick={onEdit} className={`p-2 ${themeBg} rounded-full ${themeColor}`}>
              <Edit2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-20">
          
          {/* Header Card (Photo and basic info) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-16 ${themeBg} opacity-50`}></div>
            
            <div className={`w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center relative z-10 ${themeBg} ${themeColor} mb-4`}>
              {pessoa.fotoUrl ? (
                <img src={pessoa.fotoUrl} alt={pessoa.nomeCompleto} className="w-full h-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
            
            <h2 className="text-xl font-black text-[#1e1b4b] leading-tight mb-1">{pessoa.nomeCompleto}</h2>
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${themeBg} ${themeColor} uppercase tracking-wider`}>
                {pessoa.categoria}
              </span>
              {pessoa.parentesco && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wider">
                  {pessoa.parentesco}
                </span>
              )}
            </div>

            {idade !== null && (
              <p className="text-sm text-gray-500 font-medium">
                {idade} anos
              </p>
            )}
          </div>

          {/* Termômetro Espiritual (Apenas para jovens) */}
          {(isMenina || isMenino) && (
            <TermometroEspiritual pessoa={pessoa} />
          )}

          {/* Detalhes Info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-bold text-[#1e1b4b] text-sm flex items-center">
                Informações Pessoais
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {pessoa.telefone && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5">
                    <Phone size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-0.5">Telefone</p>
                    <p className="text-sm text-[#1e1b4b] font-medium">{pessoa.telefone}</p>
                  </div>
                </div>
              )}

              {familia && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-0.5">Família / Endereço</p>
                    <p className="text-sm text-[#1e1b4b] font-medium">{familia.nomeFamilia}</p>
                    <p className="text-xs text-gray-500">{familia.endereco}, {familia.numero} - {familia.bairro}</p>
                  </div>
                </div>
              )}

              {pessoa.dataNascimento && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400 mt-0.5">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-0.5">Nascimento</p>
                    <p className="text-sm text-[#1e1b4b] font-medium">
                      {new Date(pessoa.dataNascimento).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Igreja Info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-bold text-[#1e1b4b] text-sm flex items-center">
                Dados na Congregação
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-[#f0fdf4] rounded-lg text-[#10b981] mt-0.5">
                  <Droplets size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-0.5">Batismo</p>
                  {pessoa.batizado ? (
                    <p className="text-sm text-[#10b981] font-bold">
                      Batizado(a) {pessoa.dataBatismo ? `em ${new Date(pessoa.dataBatismo).toLocaleDateString('pt-BR')}` : ''}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 font-medium">Não batizado(a)</p>
                  )}
                </div>
              </div>

              {(pessoa.isAuxiliar || pessoa.isOrganista) && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-500 mt-0.5">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold mb-0.5">Ministério / Cargo</p>
                    <p className="text-sm text-[#1e1b4b] font-medium">
                      {pessoa.isAuxiliar && "Auxiliar de Jovens e Menores"}
                      {pessoa.isAuxiliar && pessoa.isOrganista && " • "}
                      {pessoa.isOrganista && "Organista"}
                    </p>
                  </div>
                </div>
              )}

              {pessoa.observacoes && (
                <div className="mt-2 pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-500 font-bold mb-1">Observações</p>
                  <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-xl">"{pessoa.observacoes}"</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
