import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Usuario } from '../types';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, UserCheck, CheckCircle, Clock } from 'lucide-react';

export const AdminAprovacaoPage: React.FC = () => {
  const { usuarioAtivo, pessoas } = useAppContext();
  const [usuariosPendentes, setUsuariosPendentes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedPerfil, setSelectedPerfil] = useState<Record<string, string>>({});
  const [selectedPessoa, setSelectedPessoa] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPendentes();
  }, []);

  const fetchPendentes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('ativo', false);
    
    if (data) setUsuariosPendentes(data as Usuario[]);
    setLoading(false);
  };

  const handleAprovar = async (usuario: Usuario) => {
    const perfil = selectedPerfil[usuario.id] || 'jovem';
    const pessoaId = selectedPessoa[usuario.id] || null;

    if (perfil !== 'cooperador' && !pessoaId) {
      if (!confirm('Tem certeza que deseja aprovar sem vincular a um membro da família? (Geralmente apenas o Cooperador fica sem vínculo)')) {
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          perfil,
          pessoaId,
          ativo: true
        })
        .eq('id', usuario.id);
        
      if (error) throw error;
      
      alert('Usuário aprovado com sucesso!');
      fetchPendentes();
    } catch (error: any) {
      console.error(error);
      alert('Erro ao aprovar: ' + error.message);
    }
  };

  if (usuarioAtivo?.perfil !== 'cooperador') {
    return (
      <div className="p-8 text-center text-gray-500">
        <ShieldCheck size={48} className="mx-auto mb-4 text-red-300" />
        Acesso restrito.
      </div>
    );
  }

  return (
    <div className="p-4 animate-in fade-in duration-500 pb-28">
      <header className="mb-6 flex items-center space-x-2 text-[#1e1b4b]">
        <UserCheck size={28} className="text-[#8b5cf6]" />
        <h1 className="text-2xl font-bold">Aprovação de Usuários</h1>
      </header>

      {loading ? (
        <div className="text-center p-8 text-gray-400">Carregando...</div>
      ) : usuariosPendentes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
          <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
          <p className="text-gray-500 font-medium">Nenhum usuário aguardando aprovação.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {usuariosPendentes.map(u => (
            <div key={u.id} className="bg-white p-5 rounded-[24px] border border-[#f3f4f6] shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-[#1e1b4b] text-lg">{u.nome}</h3>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
                <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  <Clock size={14} className="mr-1" /> Pendente
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Definir Perfil de Acesso</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
                    value={selectedPerfil[u.id] || ''}
                    onChange={(e) => setSelectedPerfil(prev => ({ ...prev, [u.id]: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    <option value="cooperador">Cooperador (Administrador Total)</option>
                    <option value="auxiliar">Auxiliar (Lê e altera recitativos)</option>
                    <option value="pai">Pai/Mãe (Vê recitativos dos filhos)</option>
                    <option value="jovem">Jovem/Menor (Vê apenas o próprio recitativo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Vincular à Pessoa (Morador)</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
                    value={selectedPessoa[u.id] || ''}
                    onChange={(e) => setSelectedPessoa(prev => ({ ...prev, [u.id]: e.target.value }))}
                  >
                    <option value="">Nenhum vínculo...</option>
                    {pessoas.map(p => (
                      <option key={p.id} value={p.id}>{p.nomeCompleto} ({p.categoria})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">Para os perfis de Pai ou Jovem, o sistema usará este vínculo para saber quem é da família dele.</p>
                </div>

                <button
                  onClick={() => handleAprovar(u)}
                  className="w-full bg-[#10b981] text-white rounded-xl py-2.5 font-bold shadow-sm"
                >
                  Aprovar Usuário
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
