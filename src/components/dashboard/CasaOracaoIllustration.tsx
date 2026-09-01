import React from 'react';

export const CasaOracaoIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <img 
        src="/igreja.png" 
        alt="Congregação Cristã no Brasil" 
        className="w-full h-auto object-contain rounded-2xl"
      />
    </div>
  );
};


