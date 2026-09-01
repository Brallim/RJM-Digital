import React, { useState } from 'react';
import { Users, Map, List, Plus, Activity, Check } from 'lucide-react';
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
  const { comunidadeAtiva, comunidades, familias, pessoas } = useAppContext();
  const [selectedComunidadesIds, setSelectedComunidadesIds] = useState<string[]>(
    comunidadeAtiva ? [comunidadeAtiva.id] : []
  );
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedFamilia, setSelectedFamilia] = useState<Familia | null>(null);
  const [showFamiliaForm, setShowFamiliaForm] = useState(false);
  const [familiaVisitaModal, setFamiliaVisitaModal] = useState<Familia | null>(null);

  const familiasDaComunidade = familias.filter(f => selectedComunidadesIds.includes(f.comunidadeId));
  const moradoresDaComunidade = pessoas.filter(p => selectedComunidadesIds.includes(p.comunidadeId));

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
        
        <div className="flex flex-wrap justify-center gap-3 mt-1">
          {comunidades.map(comunidade => {
            const isChecked = selectedComunidadesIds.includes(comunidade.id);
            return (
              <label 
                key={comunidade.id} 
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors shadow-sm ${isChecked ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={isChecked}
                    onChange={() => {
                      setSelectedComunidadesIds(prev => 
                        prev.includes(comunidade.id) 
                          ? prev.filter(id => id !== comunidade.id)
                          : [...prev, comunidade.id]
                      );
                    }}
                  />
                  <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-gray-300'}`}>
                    {isChecked && <Check size={12} className="text-white" />}
                  </div>
                </div>
                <span className={`font-bold text-[13px] select-none ${isChecked ? 'text-[#8b5cf6]' : 'text-gray-500'}`}>{comunidade.nome}</span>
              </label>
            )
          })}
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
