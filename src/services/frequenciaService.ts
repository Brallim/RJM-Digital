import { supabase } from '../lib/supabase';

export interface Frequencia {
  reuniaoId: string;
  pessoaId: string;
  presente: boolean;
}

export const frequenciaService = {
  // Busca as frequências de uma reunião
  async getFrequenciasDaReuniao(reuniaoId: string): Promise<Frequencia[]> {
    const { data, error } = await supabase
      .from('frequencias')
      .select('*')
      .eq('reuniaoId', reuniaoId);

    if (error) {
      console.error('Erro ao buscar frequências:', error);
      return [];
    }
    return data as Frequencia[];
  },

  // Busca as frequências de uma pessoa específica
  async getFrequenciasDePessoa(pessoaId: string): Promise<Frequencia[]> {
    const { data, error } = await supabase
      .from('frequencias')
      .select('*')
      .eq('pessoaId', pessoaId);

    if (error) {
      console.error('Erro ao buscar frequências da pessoa:', error);
      return [];
    }
    return data as Frequencia[];
  },

  // Atualiza ou insere a presença/falta de um jovem
  async upsertFrequencia(reuniaoId: string, pessoaId: string, presente: boolean): Promise<void> {
    const { error } = await supabase
      .from('frequencias')
      .upsert({ 
        reuniaoId, 
        pessoaId, 
        presente 
      }, {
        onConflict: 'reuniaoId,pessoaId'
      });

    if (error) {
      console.error('Erro ao salvar frequência:', error);
      throw new Error(error.message);
    }
  }
};
