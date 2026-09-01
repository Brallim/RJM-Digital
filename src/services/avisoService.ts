import { supabase } from '../lib/supabase';
import type { Aviso } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const avisoService = {
  async getAvisos(comunidadeId: string, currentUserId: string): Promise<Aviso[]> {
    // 1. Fetch avisos
    const { data: avisosData, error: avisosError } = await supabase
      .from('avisos')
      .select(`
        *,
        usuarios (nome)
      `)
      .eq('comunidadeId', comunidadeId)
      .order('dataPublicacao', { ascending: false });

    if (avisosError) throw avisosError;

    if (!avisosData || avisosData.length === 0) return [];

    const avisoIds = avisosData.map(a => a.id);

    // 2. Fetch lidos (thumbs up) for these avisos
    const { data: lidosData, error: lidosError } = await supabase
      .from('avisos_lidos')
      .select('*')
      .in('avisoId', avisoIds);

    if (lidosError) throw lidosError;

    // 3. Map to final structure
    return avisosData.map(aviso => {
      const lidosThisAviso = lidosData?.filter(l => l.avisoId === aviso.id) || [];
      const lidoPorMim = lidosThisAviso.some(l => l.usuarioId === currentUserId);
      
      return {
        id: aviso.id,
        comunidadeId: aviso.comunidadeId,
        titulo: aviso.titulo,
        conteudo: aviso.conteudo,
        dataPublicacao: aviso.dataPublicacao,
        autorId: aviso.autorId,
        autorNome: aviso.usuarios?.nome || 'Usuário',
        totalLidos: lidosThisAviso.length,
        lidoPorMim
      };
    });
  },

  async createAviso(aviso: Omit<Aviso, 'id' | 'dataPublicacao' | 'totalLidos' | 'lidoPorMim' | 'autorNome'>) {
    const newAviso = {
      id: uuidv4(),
      ...aviso,
      dataPublicacao: new Date().toISOString()
    };

    const { error } = await supabase.from('avisos').insert(newAviso);
    if (error) throw error;
    
    return newAviso;
  },

  async toggleLido(avisoId: string, usuarioId: string, currentlyLido: boolean) {
    if (currentlyLido) {
      // Remove
      const { error } = await supabase
        .from('avisos_lidos')
        .delete()
        .match({ avisoId, usuarioId });
      if (error) throw error;
    } else {
      // Add
      const { error } = await supabase
        .from('avisos_lidos')
        .insert({ avisoId, usuarioId });
      if (error) throw error;
    }
  },

  async deleteAviso(avisoId: string) {
    const { error } = await supabase
      .from('avisos')
      .delete()
      .eq('id', avisoId);
      
    if (error) throw error;
  }
};
