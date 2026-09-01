import React, { useState } from 'react';
import { Users, Map, List, Plus, Activity, MapPin } from 'lucide-react';
import { MapVisualizer } from '../components/irmandade/MapVisualizer';
import { FamiliaListView } from '../components/irmandade/FamiliaListView';
import type { Familia } from '../types';
import { useAppContext } from '../context/AppContext';
import { FamiliaDetalheModal } from '../components/irmandade/FamiliaDetalheModal';
import { FamiliaFormModal } from '../components/irmandade/forms/FamiliaFormModal';
import { VisitaFormModal } from '../components/irmandade/forms/VisitaFormModal';
import { familiaService } from '../services/familiaService';
import { visitaService } from '../services/visitaService';

export const IrmandadePage: React.FC = () => {
  const { comunidadeAtiva, comunidades, setComunidadeAtiva, familias, pessoas } = useAppContext();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedFamilia, setSelectedFamilia] = useState<Familia | null>(null);
  const [showFamiliaForm, setShowFamiliaForm] = useState(false);
  const [familiaVisitaModal, setFamiliaVisitaModal] = useState<Familia | null>(null);

  const familiasDaComunidade = familias.filter(f => f.comunidadeId === comunidadeAtiva?.id);
  const moradoresDaComunidade = pessoas.filter(p => p.comunidadeId === comunidadeAtiva?.id);

  // Derive stats
  const visitasPrioridade = familiasDaComunidade.filter(f => f.statusVisita === 'vermelho').length;

  const handleFamiliaClick = (familia: Familia) => {
    setSelectedFamilia(familia);
  };

  const handleRegistrarVisita = (familia: Familia) => {
    setFamiliaVisitaModal(familia);
  };

  return (
    <div className="p-4 animate-in fade-in duration-500 pb-28 bg-[#fafafa] min-h-screen">
      {/* Header */}
      <header className="mb-5 text-center pt-2 flex flex-col items-center">
        <h1 className="text-xl font-bold text-[#1e1b4b] tracking-wide uppercase mb-2">Irmandade</h1>
        
        <div className="relative inline-block">
          <div className="flex items-center text-[#8b5cf6] text-sm font-semibold bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
            <MapPin size={14} className="mr-1.5 shrink-0" />
            <select 
              className="bg-transparent appearance-none outline-none font-bold text-[#8b5cf6] pr-4 cursor-pointer"
              value={comunidadeAtiva?.id || ''}
              onChange={(e) => {
                const selected = comunidades.find(c => c.id === e.target.value);
                if (selected) setComunidadeAtiva(selected);
              }}
            >
              {comunidades.map(comunidade => (
                <option key={comunidade.id} value={comunidade.id}>
                  {comunidade.nome}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="bg-purple-50 p-2 rounded-xl text-[#8b5cf6]">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Moradores</p>
            <p className="text-lg font-black text-[#1e1b4b] leading-none">{moradoresDaComunidade.length}</p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
          <div className="bg-red-50 p-2 rounded-xl text-red-500">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Prioridades</p>
            <p className="text-lg font-black text-[#1e1b4b] leading-none">{visitasPrioridade}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gray-100 p-1 rounded-xl flex space-x-1">
          <button 
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors ${viewMode === 'map' ? 'bg-white text-[#1e1b4b] shadow-sm' : 'text-gray-500'}`}
          >
            <Map size={14} className="mr-1.5" /> Mapa
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors ${viewMode === 'list' ? 'bg-white text-[#1e1b4b] shadow-sm' : 'text-gray-500'}`}
          >
            <List size={14} className="mr-1.5" /> Lista
          </button>
        </div>
        <button 
          onClick={() => {
            setSelectedFamilia(null);
            setShowFamiliaForm(true);
          }}
          className="bg-[#8b5cf6] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center shadow-sm"
        >
          <Plus size={14} className="mr-1" /> Família
        </button>
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <MapVisualizer 
          familias={familiasDaComunidade} 
          onFamiliaClick={handleFamiliaClick}
          onRegistrarVisita={handleRegistrarVisita} 
        />
      ) : (
        <FamiliaListView 
          familias={familiasDaComunidade}
          onFamiliaClick={handleFamiliaClick}
        />
      )}

      {selectedFamilia && !showFamiliaForm && (
        <FamiliaDetalheModal 
          familia={selectedFamilia} 
          onClose={() => setSelectedFamilia(null)} 
          onNovaVisita={() => handleRegistrarVisita(selectedFamilia)}
          onEdit={() => setShowFamiliaForm(true)}
        />
      )}

      {showFamiliaForm && (
        <FamiliaFormModal 
          initialData={selectedFamilia || undefined}
          onClose={() => setShowFamiliaForm(false)}
          onSave={async (familia) => {
            if (familia.id) {
              await familiaService.update(familia.id, familia);
            } else {
              await familiaService.create(familia);
            }
            setShowFamiliaForm(false);
          }}
        />
      )}

      {familiaVisitaModal && (
        <VisitaFormModal
          familiaId={familiaVisitaModal.id}
          comunidadeId={familiaVisitaModal.comunidadeId}
          onClose={() => setFamiliaVisitaModal(null)}
          onSave={async (visita) => {
            await visitaService.create(visita);
            setFamiliaVisitaModal(null);
          }}
        />
      )}
    </div>
  );
};
