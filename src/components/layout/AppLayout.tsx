import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileNavigation } from './MobileNavigation';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-800 pb-20 md:pb-0 mx-auto max-w-md w-full relative shadow-xl overflow-hidden font-sans">
      <div className="h-full overflow-y-auto overflow-x-hidden relative">
        <Outlet />
      </div>
      <MobileNavigation />
    </div>
  );
};
