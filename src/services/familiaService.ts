import { supabase } from '../lib/supabase';
import { uploadImage } from './uploadService';
import type { Familia } from '../types';

const TABLE_NAME = 'familias';

export const familiaService = {
  /**
   * Cria uma nova família
   */
  async create(data: Partial<Familia>): Promise<Familia> {
    let fotoFamiliaUrl = data.fotoFamiliaUrl || '';
    let fotoFamiliaStoragePath = '';

    // Fazer upload da foto, se houver um blob (file) local
    if (fotoFamiliaUrl && fotoFamiliaUrl.startsWith('blob:')) {
      try {
        const uploadResult = await uploadImage(fotoFamiliaUrl, 'familias');
        fotoFamiliaUrl = uploadResult.url;
        fotoFamiliaStoragePath = uploadResult.path;
      } catch (uploadError) {
        console.warn('Falha no upload da foto, salvando família sem foto:', uploadError);
        fotoFamiliaUrl = '';
        fotoFamiliaStoragePath = '';
      }
    }

    const payload = {
      ...data,
      fotoFamiliaUrl,
      fotoFamiliaStoragePath,
      ativo: true
    };
    
    // Tratar latitude e longitude que podem vir como string vazia do formulário
    if ((payload as any).latitude === '') (payload as any).latitude = null;
    else if (payload.latitude !== undefined && payload.latitude !== null) payload.latitude = Number(payload.latitude);
    
    if ((payload as any).longitude === '') (payload as any).longitude = null;
    else if (payload.longitude !== undefined && payload.longitude !== null) payload.longitude = Number(payload.longitude);

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
      console.error('Erro ao criar família no Supabase:', error);
      throw new Error(error.message + (error.details ? ` (${error.details})` : ''));
    }

    return insertedData as Familia;
  },

  /**
   * Atualiza uma família existente
   */
  async update(id: string, data: Partial<Familia>): Promise<void> {
    let updatePayload = { ...data };

    // Se a foto mudou (tem um novo blob)
    if (data.fotoFamiliaUrl && data.fotoFamiliaUrl.startsWith('blob:')) {
      try {
        const uploadResult = await uploadImage(data.fotoFamiliaUrl, 'familias');
        updatePayload.fotoFamiliaUrl = uploadResult.url;
        updatePayload.fotoFamiliaStoragePath = uploadResult.path;
      } catch (uploadError) {
        console.warn('Falha no upload da foto:', uploadError);
      }
    }
    
    updatePayload.updatedAt = new Date().toISOString();
    
    if ((updatePayload as any).latitude === '') (updatePayload as any).latitude = null;
    else if (updatePayload.latitude !== undefined && updatePayload.latitude !== null) updatePayload.latitude = Number(updatePayload.latitude);
    
    if ((updatePayload as any).longitude === '') (updatePayload as any).longitude = null;
    else if (updatePayload.longitude !== undefined && updatePayload.longitude !== null) updatePayload.longitude = Number(updatePayload.longitude);

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
      console.error('Erro ao atualizar família no Supabase:', error);
      throw error;
    }
  }
};
