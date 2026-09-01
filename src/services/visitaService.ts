import { supabase } from '../lib/supabase';
import { uploadImage } from './uploadService';
import type { Visita } from '../types';

const TABLE_NAME = 'visitas';

export const visitaService = {
  /**
   * Cria uma nova visita
   */
  async create(data: Partial<Visita>): Promise<Visita> {
    let fotoVisitaUrl = data.fotoVisitaUrl || '';

    // Fazer upload da selfie, se houver um blob (file) local
    if (fotoVisitaUrl && fotoVisitaUrl.startsWith('blob:')) {
      try {
        const uploadResult = await uploadImage(fotoVisitaUrl, 'visitas');
        fotoVisitaUrl = uploadResult.url;
      } catch (uploadError) {
        console.warn('Falha no upload da foto, salvando visita sem foto:', uploadError);
        fotoVisitaUrl = '';
      }
    }

    const payload = {
      ...data,
      fotoVisitaUrl
    };
    
    // Converter arrays (visitantes, moradoresPresentes) para jsonb ou text[]
    // Supabase JS handle array insertions natively for array columns.

    // Remove undefined properties before sending to Supabase
    Object.keys(payload).forEach(key => {
      if ((payload as any)[key] === undefined) {
        delete (payload as any)[key];
      }
    });

    const { data: insertedData, error } = await supabase
      .from(TABLE_NAME)
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar visita no Supabase:', error);
      throw new Error(error.message + (error.details ? ` (${error.details})` : ''));
    }

    // Após inserir a visita, atualiza a data da ultimaVisita da família
    if (data.familiaId && data.dataVisita) {
      await supabase
        .from('familias')
        .update({ ultimaVisita: data.dataVisita })
        .eq('id', data.familiaId);
    }

    return insertedData as Visita;
  },

  /**
   * Atualiza uma visita existente
   */
  async update(id: string, data: Partial<Visita>): Promise<void> {
    let updatePayload = { ...data };

    if (data.fotoVisitaUrl && data.fotoVisitaUrl.startsWith('blob:')) {
      try {
        const uploadResult = await uploadImage(data.fotoVisitaUrl, 'visitas');
        updatePayload.fotoVisitaUrl = uploadResult.url;
      } catch (uploadError) {
        console.warn('Falha no upload da foto:', uploadError);
      }
    }
    
    updatePayload.updatedAt = new Date().toISOString();
    
    // Remove undefined properties
    Object.keys(updatePayload).forEach(key => {
      if ((updatePayload as any)[key] === undefined) {
        delete (updatePayload as any)[key];
      }
    });

    const { error } = await supabase
      .from(TABLE_NAME)
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar visita no Supabase:', error);
      throw new Error(error.message + (error.details ? ` (${error.details})` : ''));
    }
  }
};
