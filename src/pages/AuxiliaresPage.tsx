import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, BookOpen } from 'lucide-react';
import { getDefaultAvatar } from '../utils/avatar';

export const AuxiliaresPage: React.FC = () => {
  const { pessoas } = useAppContext();
  
  // Filter for all auxiliares across all communities
  const auxiliares = pessoas.filter(p => p.isAuxiliar);

  return (
    <div className="p-4 animate-in fade-in duration-500 pb-28 bg-[#fafafa] min-h-screen">
      <header className="mb-6 text-center pt-2 flex flex-col items-center">
        <h1 className="text-xl font-bold text-[#1e1b4b] tracking-wide uppercase mb-2">Auxiliares</h1>
        <p className="text-sm text-gray-500 font-medium">
          Todas as congregações
        </p>
      </header>

      {auxiliares.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm mt-8">
          <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
          <h2 className="text-lg font-bold text-[#1e1b4b] mb-1">Nenhum Auxiliar</h2>
          <p className="text-gray-500 text-sm">Ainda não há auxiliares cadastrados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {auxiliares.map(a => (
            <div key={a.id} className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-start space-x-4">
              {getDefaultAvatar({ fotoUrl: a.fotoUrl, categoria: 'adulto', sexo: a.sexo }) ? (
                <img src={getDefaultAvatar({ fotoUrl: a.fotoUrl, categoria: 'adulto', sexo: a.sexo })!} alt={a.nomeCompleto} className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-purple-100" />
              ) : (
                <div className="w-12 h-12 bg-[#f5f3ff] rounded-full flex items-center justify-center text-[#8b5cf6] shrink-0 border border-purple-100">
                  <Users size={24} />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-[#1e1b4b] text-[15px]">{a.nomeCompleto}</h4>
                <div className="text-[12px] text-gray-500 mt-1 flex flex-col space-y-0.5">
                  <span className="font-medium text-[#8b5cf6]">Categoria: {a.categoria}</span>
                  {a.telefone && <span>📞 {a.telefone}</span>}
                  {a.dataApresentacao && <span>Apresentado(a) em: {a.dataApresentacao}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
