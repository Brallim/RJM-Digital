import { supabase } from '../lib/supabase';
import { uploadImage } from './uploadService';
import type { Pessoa } from '../types';

const TABLE_NAME = 'pessoas';

export const pessoaService = {
  /**
   * Cria uma nova pessoa (morador)
   */
  async create(data: Partial<Pessoa>): Promise<Pessoa> {
    let fotoUrl = data.fotoUrl || '';
    let fotoStoragePath = '';

    // Fazer upload da foto individual, se houver blob local
    if (fotoUrl && fotoUrl.startsWith('blob:')) {
      try {
        const uploadResult = await uploadImage(fotoUrl, 'pessoas');
        fotoUrl = uploadResult.url;
        fotoStoragePath = uploadResult.path;
      } catch (uploadError) {
        console.warn('Falha no upload da foto, salvando morador sem foto:', uploadError);
        fotoUrl = '';
        fotoStoragePath = '';
      }
    }

    const payload = {
      ...data,
      fotoUrl,
      fotoStoragePath,
      ativo: true
    };

    // Converter string vazia de data para null para o PostgreSQL aceitar
    if (payload.dataBatismo === '') {
      payload.dataBatismo = null;
    }

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
      console.error('Erro ao criar pessoa no Supabase:', error);
      throw error;
    }

    return insertedData as Pessoa;
  },

  /**
   * Atualiza uma pessoa existente
   */
  async update(id: string, data: Partial<Pessoa>): Promise<void> {
    let updatePayload = { ...data };

    if (data.fotoUrl && data.fotoUrl.startsWith('blob:')) {
      try {
        const uploadResult = await uploadImage(data.fotoUrl, 'pessoas');
        updatePayload.fotoUrl = uploadResult.url;
        updatePayload.fotoStoragePath = uploadResult.path;
      } catch (uploadError) {
        console.warn('Falha no upload da foto:', uploadError);
      }
    }
    
    updatePayload.updatedAt = new Date().toISOString();
    
    // Remove undefined properties before sending to Supabase
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
      console.error('Erro ao atualizar pessoa no Supabase:', error);
      throw error;
    }
  }
};
