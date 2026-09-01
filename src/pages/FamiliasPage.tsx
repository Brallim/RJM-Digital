import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { mockFamilias } from '../mock';
import { MapPin, Users, Phone, Plus, Map as MapIcon, List as ListIcon } from 'lucide-react';

export const FamiliasPage: React.FC = () => {
  const { comunidadeAtiva } = useAppContext();
  const [viewMode, setViewMode] = useState<'lista' | 'mapa'>('lista');

  const familiasAtuais = mockFamilias.filter(f => f.comunidadeId === comunidadeAtiva?.id);

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-primary">Famílias</h1>
          <p className="text-sm text-gray-500">{comunidadeAtiva?.nome}</p>
        </div>
        <button className="flex items-center space-x-1 text-primary text-sm font-semibold bg-primary-light/50 px-3 py-1.5 rounded-full">
          <Plus size={16} /> <span>Nova família</span>
        </button>
      </header>

      {/* Toggle */}
      <div className="bg-gray-100 p-1 rounded-xl flex items-center">
        <button 
          className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition ${viewMode === 'lista' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
          onClick={() => setViewMode('lista')}
        >
          <ListIcon size={16} /> <span>Lista</span>
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition ${viewMode === 'mapa' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}
          onClick={() => setViewMode('mapa')}
        >
          <MapIcon size={16} /> <span>Mapa</span>
        </button>
      </div>

      {viewMode === 'lista' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-700">Famílias cadastradas</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{familiasAtuais.length} total</span>
          </div>

          {familiasAtuais.map(familia => (
            <div key={familia.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
              <div className={`p-3 rounded-full ${familia.statusVisita === 'verde' ? 'bg-green-100 text-green-600' : familia.statusVisita === 'amarelo' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                <Users size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-800">{familia.nomeFamilia}</h3>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Ativa</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Resp: {familia.responsavel1}</p>
                <div className="flex items-center text-xs text-gray-500 space-x-1 mb-2">
                  <Phone size={12} /> <span>{familia.telefone}</span>
                </div>
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50">
                  <div className="text-xs">
                    <span className="text-gray-400">Última visita: </span>
                    <span className="font-semibold text-gray-700">{familia.ultimaVisita || 'N/A'}</span>
                  </div>
                  {familia.proximaVisita && (
                    <div className="text-xs text-primary font-semibold">Agendada: {familia.proximaVisita}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[60vh] bg-gray-200 rounded-3xl border border-gray-300 flex items-center justify-center relative overflow-hidden">
          <div className="text-gray-500 flex flex-col items-center">
            <MapPin size={48} className="mb-2 text-gray-400" />
            <p className="font-semibold">Mapa interativo será renderizado aqui</p>
            <p className="text-sm text-gray-400">(Leaflet + OpenStreetMap)</p>
          </div>
          {/* Mock markers overlay just for show */}
          <div className="absolute top-1/4 left-1/4 text-green-500"><MapPin size={32} fill="currentColor" /></div>
          <div className="absolute bottom-1/3 right-1/4 text-yellow-500"><MapPin size={32} fill="currentColor" /></div>
          
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl p-3 shadow-lg text-xs space-y-1">
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span>Visitada (últimos 30 dias)</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Visita agendada / Atenção</span></div>
            <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span>Não visitada / Atrasada</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
