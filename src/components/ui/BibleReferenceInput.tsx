import React, { useState, useEffect } from 'react';
import { LIVROS_BIBLIA } from '../../utils/biblia';

interface BibleReferenceInputProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  className?: string;
  placeholder?: string;
}

export const BibleReferenceInput: React.FC<BibleReferenceInputProps> = ({ value, onChange, className, placeholder }) => {
  const [livro, setLivro] = useState('');
  const [capituloVersiculo, setCapituloVersiculo] = useState('');

  // Sincroniza o prop value com o estado local
  useEffect(() => {
    if (!value) {
      setLivro('');
      setCapituloVersiculo('');
      return;
    }

    // Tenta encontrar qual livro está na string
    const foundBook = LIVROS_BIBLIA.find(book => value.startsWith(book));
    if (foundBook) {
      setLivro(foundBook);
      setCapituloVersiculo(value.slice(foundBook.length).trim());
    } else {
      // Se não achar um livro conhecido (ex: dados antigos), joga tudo pro texto
      setLivro('');
      setCapituloVersiculo(value);
    }
  }, [value]);

  const handleLivroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoLivro = e.target.value;
    setLivro(novoLivro);
    const newValue = novoLivro ? `${novoLivro} ${capituloVersiculo}`.trim() : capituloVersiculo;
    onChange(newValue);
  };

  const handleCapituloVersiculoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoRef = e.target.value;
    setCapituloVersiculo(novoRef);
    const newValue = livro ? `${livro} ${novoRef}`.trim() : novoRef;
    onChange(newValue);
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className || ''}`}>
      <select 
        value={livro} 
        onChange={handleLivroChange}
        className="w-full sm:w-2/5 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#8b5cf6]"
      >
        <option value="">Livro...</option>
        {LIVROS_BIBLIA.map(book => (
          <option key={book} value={book}>{book}</option>
        ))}
      </select>
      
      <input 
        type="text" 
        value={capituloVersiculo} 
        onChange={handleCapituloVersiculoChange} 
        placeholder={placeholder || "Cap. e Vers. (Ex: 1:1-3)"} 
        className="w-full sm:w-3/5 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#8b5cf6]" 
      />
    </div>
  );
};
