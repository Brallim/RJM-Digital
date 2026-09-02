import type { Pessoa } from '../types';

export const getDefaultAvatar = (pessoa: Partial<Pessoa>): string | null => {
  if (pessoa.fotoUrl) return pessoa.fotoUrl;
  
  if (pessoa.categoria === 'menino') return '/avatars/menino.jpg';
  if (pessoa.categoria === 'menina') return '/avatars/menina.jpg';
  if (pessoa.categoria === 'moco' || (pessoa.categoria === 'adulto' && pessoa.sexo === 'M')) return '/avatars/moco.jpg';
  if (pessoa.categoria === 'moca' || (pessoa.categoria === 'adulto' && pessoa.sexo === 'F')) return '/avatars/moca.jpg';
  
  return null;
};
