import { supabase } from '../lib/supabase';
import type { Reuniao } from '../types';

const TABLE_NAME = 'reunioes';

export const reuniaoService = {
  async create(data: Partial<Reuniao>): Promise<Reuniao> {
    const payload = { ...data };
    
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
      console.error('Erro ao criar reunião no Supabase:', error);
      throw new Error(error.message + (error.details ? ` (${error.details})` : ''));
    }

    return insertedData as Reuniao;
  },

  async update(id: string, data: Partial<Reuniao>): Promise<void> {
    const updatePayload = { ...data };
    
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
      console.error('Erro ao atualizar reunião no Supabase:', error);
      throw new Error(error.message + (error.details ? ` (${error.details})` : ''));
    }
  },
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar reunião no Supabase:', error);
      throw new Error(error.message + (error.details ? ` (${error.details})` : ''));
    }
  }
};
