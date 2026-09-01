import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, MoreHorizontal, BookOpen, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const MobileNavigation: React.FC = () => {
  const { usuarioAtivo } = useAppContext();

  const navItems = [
    { to: '/', label: 'Início', icon: Home, color: 'text-[#8b5cf6]', activeBg: 'bg-[#f5f3ff]', roles: ['cooperador', 'auxiliar', 'pai', 'jovem'] },
    { to: '/irmandade', label: 'Irmandade', icon: Users, color: 'text-[#10b981]', activeBg: 'bg-emerald-50', roles: ['cooperador', 'auxiliar'] },
    { to: '/auxiliares', label: 'Auxiliares', icon: BookOpen, color: 'text-[#ec4899]', activeBg: 'bg-[#fff0f6]', roles: ['cooperador', 'auxiliar'] },
    { to: '/admin', label: 'Aprovações', icon: ShieldCheck, color: 'text-amber-500', activeBg: 'bg-amber-50', roles: ['cooperador'] },
  ];

  const visibleItems = navItems.filter(item => 
    usuarioAtivo && item.roles.includes(usuarioAtivo.perfil)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] md:absolute pb-safe z-50 rounded-t-3xl">
      <ul className="flex justify-around items-center h-20 px-2">
        {visibleItems.map((item) => (
          <li key={item.to} className="flex flex-1 justify-center">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-[76px] py-2 rounded-2xl transition-colors ${
                  isActive ? item.activeBg : 'bg-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={item.color} />
                  <span className={`text-[10px] font-bold mt-1 ${item.color}`}>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
