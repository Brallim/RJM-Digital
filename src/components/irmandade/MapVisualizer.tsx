import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Familia } from '../../types';

interface MapVisualizerProps {
  familias: Familia[];
  onFamiliaClick: (familia: Familia) => void;
  onRegistrarVisita: (familia: Familia) => void;
}

const getMarkerIcon = (ultimaVisita?: string) => {
  // Determina a cor baseada na data da última visita
  let color = '#dc2626'; // Vermelho por padrão (sem visita ou + de 1 ano)
  
  if (ultimaVisita) {
    const lastVisitDate = new Date(ultimaVisita);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays <= 365) {
      color = '#16a34a'; // Verde se visitado em até 1 ano
    }
  }
  
  // Desenho de um pino (agulha) em SVG
  const svgIcon = `
    <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 8.4 12 24 12 24s12-15.6 12-24c0-6.627-5.373-12-12-12zm0 17c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-pin-marker',
    html: svgIcon,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
};

export const MapVisualizer: React.FC<MapVisualizerProps> = ({ familias, onFamiliaClick, onRegistrarVisita }) => {
  const defaultCenter: [number, number] = [-20.423, -49.975];

  return (
    <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-gray-100 shadow-sm z-0">
      <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {familias.filter(f => f.latitude && f.longitude).map((f) => (
          <Marker 
            key={f.id} 
            position={[f.latitude!, f.longitude!]} 
            icon={getMarkerIcon(f.ultimaVisita)}
          >
            <Popup>
              <div className="p-1 min-w-[150px]">
                {f.fotoFamiliaUrl && (
                  <img src={f.fotoFamiliaUrl} alt="Família" className="w-full h-24 object-cover rounded-xl mb-2" />
                )}
                <h3 className="font-bold text-[#1e1b4b] text-base mb-1">{f.nomeFamilia}</h3>
                <p className="text-xs text-gray-600 mb-1">{f.endereco}, {f.numero}</p>
                <p className="text-xs text-gray-600 mb-3">{f.telefonePrincipal || f.telefone}</p>
                
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onFamiliaClick(f); }}
                    className="bg-[#f5f3ff] text-[#8b5cf6] font-bold py-1.5 px-3 rounded-xl text-xs w-full text-center"
                  >
                    Ver família
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRegistrarVisita(f); }}
                    className="bg-[#10b981] text-white font-bold py-1.5 px-3 rounded-xl text-xs w-full text-center"
                  >
                    Registrar visita
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
