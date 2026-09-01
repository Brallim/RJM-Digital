import React from 'react';
import { MapPin, CalendarDays, Phone, ChevronRight, Users } from 'lucide-react';
import type { Familia } from '../../types';

interface FamiliaListViewProps {
  familias: Familia[];
  onFamiliaClick: (familia: Familia) => void;
}

const getStatusColor = (status: Familia['statusVisita']) => {
  switch (status) {
    case 'verde': return 'bg-green-500';
    case 'amarelo': return 'bg-yellow-500';
    case 'vermelho': return 'bg-red-500';
    case 'azul': return 'bg-blue-500';
    case 'cinza':
    default: return 'bg-gray-400';
  }
};

const getStatusLabel = (status: Familia['statusVisita']) => {
  switch (status) {
    case 'verde': return 'Em dia';
    case 'amarelo': return 'Atenção';
    case 'vermelho': return 'Prioridade';
    case 'azul': return 'Agendado';
    case 'cinza':
    default: return 'Sem registro';
  }
};

export const FamiliaListView: React.FC<FamiliaListViewProps> = ({ familias, onFamiliaClick }) => {
  return (
    <div className="space-y-3 pb-6">
      {familias.map(f => (
        <div 
          key={f.id} 
          onClick={() => onFamiliaClick(f)}
          className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-start space-x-3 flex-1">
            <div className="relative shrink-0">
              {f.fotoFamiliaUrl ? (
                <img src={f.fotoFamiliaUrl} alt="Família" className="w-12 h-12 rounded-2xl object-cover border border-gray-100" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                  <Users size={20} />
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getStatusColor(f.statusVisita)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#1e1b4b] text-base leading-tight mb-1">{f.nomeFamilia}</h3>
              
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <MapPin size={12} className="mr-1 text-[#8b5cf6]" />
                <span className="truncate">{f.endereco}, {f.numero}</span>
              </div>
              
              <div className="flex flex-wrap gap-y-1 gap-x-3 text-[11px] text-gray-500">
                <div className="flex items-center">
                  <Phone size={12} className="mr-1 text-gray-400" />
                  <span>{f.telefonePrincipal || f.telefone}</span>
                </div>
                <div className="flex items-center">
                  <CalendarDays size={12} className="mr-1 text-gray-400" />
                  <span>Última: {f.ultimaVisita ? new Date(f.ultimaVisita).toLocaleDateString('pt-BR') : 'Nenhuma'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 ml-2">
            <ChevronRight size={18} className="text-gray-300 mb-2" />
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(f.statusVisita).replace('bg-', 'text-').replace('-500', '-700')} bg-opacity-10 ${getStatusColor(f.statusVisita)}`}>
              {getStatusLabel(f.statusVisita)}
            </span>
          </div>
        </div>
      ))}
      
      {familias.length === 0 && (
        <div className="text-center py-10 text-gray-500 text-sm">
          Nenhuma família encontrada.
        </div>
      )}
    </div>
  );
};
