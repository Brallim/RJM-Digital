import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Usuario, Pessoa, Perfil } from '../types';
import { useAppContext } from '../context/AppContext';
import { UserCog, CheckCircle, Clock, ShieldAlert, User, Search, Link as LinkIcon, Unlink, X, Plus, ArrowLeft } from 'lucide-react';
import { getDefaultAvatar } from '../utils/avatar';
import { familiaService } from '../services/familiaService';
import { pessoaService } from '../services/pessoaService';

type SituacaoGeral = 'pendente' | 'sem_acesso' | 'vinculado';

interface GestaoItem {
  id: string; // unique key
  situacao: SituacaoGeral;
  usuario?: Usuario;
  pessoa?: Pessoa;
}

export const UsuariosPage: React.FC = () => {
  const { usuarioAtivo, pessoas } = useAppContext();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filtro, setFiltro] = useState<'todos' | 'pendentes' | 'com_acesso' | 'sem_acesso'>('todos');
  const [busca, setBusca] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<GestaoItem | null>(null);
  
  // Form State inside Modal
  const [selectedPessoaId, setSelectedPessoaId] = useState<string>('');
  const [selectedPerfil, setSelectedPerfil] = useState<Perfil | ''>('');
  const [buscaPessoaModal, setBuscaPessoaModal] = useState('');

  // Quick Add State
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    nomeDaFamilia: '',
    dataNascimento: '',
    sexo: 'F',
    categoria: 'adulto'
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (data) setUsuarios(data as Usuario[]);
    setLoading(false);
  };

  const itens = useMemo(() => {
    const list: GestaoItem[] = [];
    const usuariosVinculadosIds = new Set<string>();

    // 1. Processar todos os Usuários
    usuarios.forEach(u => {
      if (u.pessoaId) {
        const pessoa = pessoas.find(p => p.id === u.pessoaId);
        if (pessoa) {
          list.push({ id: `u-${u.id}`, situacao: 'vinculado', usuario: u, pessoa });
          usuariosVinculadosIds.add(pessoa.id);
        } else {
          // Usuário tem um pessoaId mas a pessoa não foi encontrada (deletada?)
          list.push({ id: `u-${u.id}`, situacao: 'pendente', usuario: u });
        }
      } else {
        // Usuário sem pessoa vinculada (pendente de aprovação)
        list.push({ id: `u-${u.id}`, situacao: 'pendente', usuario: u });
      }
    });

    // 2. Processar todas as Pessoas que não estão vinculadas
    pessoas.forEach(p => {
      if (!usuariosVinculadosIds.has(p.id)) {
        list.push({ id: `p-${p.id}`, situacao: 'sem_acesso', pessoa: p });
      }
    });

    return list.sort((a, b) => {
      // Prioridade: Pendentes > Vinculados > Sem acesso
      const order = { pendente: 1, vinculado: 2, sem_acesso: 3 };
      if (order[a.situacao] !== order[b.situacao]) {
        return order[a.situacao] - order[b.situacao];
      }
      // Ordem alfabética
      const nomeA = a.usuario?.nome || a.pessoa?.nomeCompleto || '';
      const nomeB = b.usuario?.nome || b.pessoa?.nomeCompleto || '';
      return nomeA.localeCompare(nomeB);
    });
  }, [usuarios, pessoas]);

  const itensFiltrados = useMemo(() => {
    let filtrados = itens;

    if (filtro === 'pendentes') filtrados = filtrados.filter(i => i.situacao === 'pendente');
    if (filtro === 'com_acesso') filtrados = filtrados.filter(i => i.situacao === 'vinculado');
    if (filtro === 'sem_acesso') filtrados = filtrados.filter(i => i.situacao === 'sem_acesso');

    if (busca) {
      const q = busca.toLowerCase();
      filtrados = filtrados.filter(i => {
        const nomeU = i.usuario?.nome?.toLowerCase() || '';
        const emailU = i.usuario?.email?.toLowerCase() || '';
        const nomeP = i.pessoa?.nomeCompleto?.toLowerCase() || '';
        return nomeU.includes(q) || emailU.includes(q) || nomeP.includes(q);
      });
    }

    return filtrados;
  }, [itens, filtro, busca]);

  // Handler para abrir modal e preencher os dados
  const handleOpenAction = (item: GestaoItem) => {
    setItemSelecionado(item);
    
    // Se já estiver vinculado, preenche os dados atuais
    if (item.situacao === 'vinculado' && item.usuario) {
      setSelectedPessoaId(item.usuario.pessoaId || '');
      setSelectedPerfil(item.usuario.perfil || '');
    } 
    // Se for pendente, deixa em branco (exceto se for apenas alteração de perfil para admin)
    else {
      setSelectedPessoaId('');
      setSelectedPerfil('');
    }
    
    setBuscaPessoaModal('');
    setShowQuickAdd(false);
    setModalOpen(true);
  };

  const handleQuickAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuickAddData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvarVinculo = async () => {
    if (!itemSelecionado?.usuario) return;
    
    let finalPessoaId = selectedPessoaId;
    
    if (showQuickAdd) {
      if (!quickAddData.nomeDaFamilia || !quickAddData.dataNascimento || !quickAddData.categoria) {
        alert('Por favor, preencha todos os campos do cadastro rápido.');
        return;
      }
      if (!selectedPerfil) {
        alert('Por favor, selecione o perfil de acesso.');
        return;
      }
      
      try {
        // 1. Criar Família (com dados mínimos)
        const novaFamilia = await familiaService.create({
          nomeFamilia: quickAddData.nomeDaFamilia,
          endereco: 'Não informado',
          numero: 'S/N',
          bairro: 'Não informado',
          cidade: 'Não informado',
          cep: '00000000',
          comunidadeId: usuarioAtivo?.comunidadesPermitidas[0] || '1', // fallback
          ativo: true
        });

        // 2. Criar Pessoa
        const novaPessoa = await pessoaService.create({
          nomeCompleto: itemSelecionado.usuario.nome, // Pega o nome do usuário
          dataNascimento: quickAddData.dataNascimento,
          sexo: quickAddData.sexo as any,
          categoria: quickAddData.categoria as any,
          familiaId: novaFamilia.id,
          comunidadeId: novaFamilia.comunidadeId,
          batizado: false,
          ativo: true
        });

        finalPessoaId = novaPessoa.id;
        
      } catch (error: any) {
        console.error('Erro ao criar cadastro rápido:', error);
        alert('Erro ao criar cadastro: ' + error.message);
        return;
      }
    } else {
      if (!finalPessoaId || !selectedPerfil) {
        alert('Selecione o morador correspondente e o perfil de acesso.');
        return;
      }

      // Regra de Integridade: Verificar duplicidade
      const conflito = usuarios.find(u => u.pessoaId === finalPessoaId && u.id !== itemSelecionado.usuario!.id);
      if (conflito) {
        alert('Esta pessoa já possui uma conta de acesso vinculada (' + conflito.email + '). Não é possível vincular duas contas à mesma pessoa.');
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          pessoaId: finalPessoaId,
          perfil: selectedPerfil,
          status: 'ativo',
          ativo: true // Mantido por compatibilidade
        })
        .eq('id', itemSelecionado.usuario.id);
        
      if (error) throw error;
      
      alert('Conta vinculada e aprovada com sucesso!');
      setModalOpen(false);
      fetchUsuarios();
    } catch (error: any) {
      console.error(error);
      alert('Erro ao vincular: ' + error.message);
    }
  };

  const handleDesvincular = async () => {
    if (!itemSelecionado?.usuario) return;
    
    if (!confirm(`Tem certeza que deseja DESVINCULAR a conta de ${itemSelecionado.usuario.email} desta pessoa? A pessoa continuará existindo, apenas perderá o acesso ao app.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          pessoaId: null,
          status: 'pendente',
          ativo: false,
          perfil: null
        })
        .eq('id', itemSelecionado.usuario.id);
        
      if (error) throw error;
      
      alert('Conta desvinculada com sucesso.');
      setModalOpen(false);
      fetchUsuarios();
    } catch (error: any) {
      console.error(error);
      alert('Erro ao desvincular: ' + error.message);
    }
  };

  if (usuarioAtivo?.perfil !== 'cooperador') {
    return (
      <div className="p-8 text-center text-gray-500">
        <ShieldAlert size={48} className="mx-auto mb-4 text-red-300" />
        Acesso restrito a Cooperadores.
      </div>
    );
  }

  // Filtragem das pessoas para o modal
  const pessoasParaVinculo = pessoas.filter(p => {
    const nome = p.nomeCompleto.toLowerCase();
    const isAvailable = !usuarios.some(u => u.pessoaId === p.id && u.id !== itemSelecionado?.usuario?.id);
    const matchesBusca = buscaPessoaModal === '' || nome.includes(buscaPessoaModal.toLowerCase());
    return isAvailable && matchesBusca;
  });

  return (
    <div className="p-4 animate-in fade-in duration-500 pb-28">
      <header className="mb-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-2 text-[#1e1b4b]">
          <UserCog size={28} className="text-[#8b5cf6]" />
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
          />
        </div>

        {/* Filtros */}
        <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
          <button
            onClick={() => setFiltro('todos')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${filtro === 'todos' ? 'bg-[#1e1b4b] text-white border-[#1e1b4b] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('pendentes')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${filtro === 'pendentes' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-amber-600 border-amber-100 hover:bg-amber-50'}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFiltro('com_acesso')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${filtro === 'com_acesso' ? 'bg-[#10b981] text-white border-[#10b981] shadow-sm' : 'bg-white text-[#10b981] border-emerald-100 hover:bg-emerald-50'}`}
          >
            Com acesso
          </button>
          <button
            onClick={() => setFiltro('sem_acesso')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${filtro === 'sem_acesso' ? 'bg-gray-500 text-white border-gray-500 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
          >
            Sem acesso
          </button>
        </div>
      </header>

      {loading ? (
        <div className="text-center p-8 text-gray-400 font-medium">Carregando usuários...</div>
      ) : itensFiltrados.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-10 text-center shadow-sm">
          <UserCog size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold text-lg">Nenhum registro encontrado.</p>
          <p className="text-gray-400 text-sm mt-1">Tente ajustar seus filtros de busca.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {itensFiltrados.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50 flex items-center justify-center">
                  {item.pessoa ? (
                    <img src={getDefaultAvatar(item.pessoa)!} alt={item.pessoa.nomeCompleto} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-gray-400" />
                  )}
                </div>
                
                {/* Detalhes */}
                <div className="flex flex-col">
                  <h3 className="font-bold text-[#1e1b4b] text-[15px] leading-tight">
                    {item.situacao === 'pendente' ? item.usuario?.nome : item.pessoa?.nomeCompleto}
                  </h3>
                  
                  {item.situacao === 'pendente' && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.usuario?.email}</p>
                  )}
                  
                  {item.situacao === 'vinculado' && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.usuario?.email} • <span className="font-bold text-[#8b5cf6] capitalize">{item.usuario?.perfil}</span>
                    </p>
                  )}
                  
                  {item.situacao === 'sem_acesso' && item.pessoa && (
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      {item.pessoa.categoria} • {item.pessoa.comunidadeId}
                    </p>
                  )}
                </div>
              </div>

              {/* Status & Ações */}
              <div className="flex items-center justify-between md:justify-end gap-3 mt-2 md:mt-0 border-t md:border-t-0 border-gray-50 pt-3 md:pt-0">
                {item.situacao === 'pendente' && (
                  <>
                    <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold flex items-center shrink-0">
                      <Clock size={14} className="mr-1.5" /> Aguardando Aprovação
                    </div>
                    <button 
                      onClick={() => handleOpenAction(item)}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 shadow-sm"
                    >
                      Aprovar
                    </button>
                  </>
                )}
                
                {item.situacao === 'sem_acesso' && (
                  <div className="text-gray-400 text-xs font-bold px-3 py-1 bg-gray-50 rounded-full flex items-center shrink-0">
                    <User size={14} className="mr-1.5" /> Sem acesso ao app
                  </div>
                )}
                
                {item.situacao === 'vinculado' && (
                  <>
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center shrink-0">
                      <CheckCircle size={14} className="mr-1.5" /> Ativo
                    </div>
                    <button 
                      onClick={() => handleOpenAction(item)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors shrink-0"
                      title="Editar Vínculo/Perfil"
                    >
                      <UserCog size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE VINCULAÇÃO / EDIÇÃO */}
      {modalOpen && itemSelecionado && itemSelecionado.usuario && (
        <div className="fixed inset-0 bg-black/40 z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1e1b4b] flex items-center">
                {itemSelecionado.situacao === 'vinculado' ? (
                  <><UserCog size={22} className="text-[#8b5cf6] mr-2" /> Editar Vínculo</>
                ) : (
                  <><LinkIcon size={22} className="text-amber-500 mr-2" /> Aprovar e Vincular</>
                )}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Passo 1: Conta Solicitante */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Conta do Aplicativo</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                    {itemSelecionado.usuario.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#1e1b4b] text-sm">{itemSelecionado.usuario.nome}</p>
                    <p className="text-xs text-gray-500">{itemSelecionado.usuario.email}</p>
                  </div>
                </div>
              </div>

              {/* Passo 2: Selecionar Pessoa ou Cadastro Rápido */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#1e1b4b]">
                    {showQuickAdd ? 'Cadastrar Novo Morador e Família *' : 'Selecionar Cadastro da Irmandade (Pessoa) *'}
                  </label>
                  {!showQuickAdd && itemSelecionado.situacao !== 'vinculado' && (
                    <button 
                      onClick={() => setShowQuickAdd(true)}
                      className="text-[10px] font-bold text-[#8b5cf6] bg-purple-50 px-2 py-1 rounded-lg flex items-center hover:bg-purple-100 transition-colors"
                    >
                      <Plus size={12} className="mr-1" /> Novo Cadastro
                    </button>
                  )}
                  {showQuickAdd && (
                    <button 
                      onClick={() => setShowQuickAdd(false)}
                      className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg flex items-center hover:bg-gray-200 transition-colors"
                    >
                      <ArrowLeft size={12} className="mr-1" /> Voltar para Busca
                    </button>
                  )}
                </div>
                
                {showQuickAdd ? (
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">Nome da Nova Família *</label>
                      <input
                        type="text"
                        name="nomeDaFamilia"
                        placeholder="Ex: Família Silva"
                        value={quickAddData.nomeDaFamilia}
                        onChange={handleQuickAddChange}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Data de Nascimento *</label>
                        <input
                          type="date"
                          name="dataNascimento"
                          value={quickAddData.dataNascimento}
                          onChange={handleQuickAddChange}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Sexo *</label>
                        <select
                          name="sexo"
                          value={quickAddData.sexo}
                          onChange={handleQuickAddChange}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
                        >
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">Categoria *</label>
                      <select
                        name="categoria"
                        value={quickAddData.categoria}
                        onChange={handleQuickAddChange}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
                      >
                        <option value="adulto">Adulto</option>
                        <option value="jovem">Jovem (Geral)</option>
                        <option value="moco">Moço</option>
                        <option value="moca">Moça</option>
                        <option value="menino">Menino</option>
                        <option value="menina">Menina</option>
                      </select>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-tight">
                      Este formulário criará uma família e um morador básicos. O nome do morador será o mesmo da conta ({itemSelecionado.usuario.nome}). Você poderá editar os demais dados na aba Famílias depois.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar pessoa..."
                        value={buscaPessoaModal}
                        onChange={(e) => setBuscaPessoaModal(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] transition-all"
                      />
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                      {pessoasParaVinculo.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">Nenhuma pessoa disponível.</div>
                      ) : (
                        pessoasParaVinculo.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => setSelectedPessoaId(p.id)}
                            className={`p-3 border-b border-gray-50 flex items-center space-x-3 cursor-pointer transition-colors ${selectedPessoaId === p.id ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shrink-0">
                              <img src={getDefaultAvatar(p)!} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold truncate ${selectedPessoaId === p.id ? 'text-[#8b5cf6]' : 'text-gray-700'}`}>{p.nomeCompleto}</p>
                              <p className="text-[10px] text-gray-500 truncate capitalize">{p.categoria} • Família {p.familiaId.substring(0, 4)}</p>
                            </div>
                            {selectedPessoaId === p.id && <CheckCircle size={18} className="text-[#8b5cf6]" />}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Passo 3: Perfil */}
              <div>
                <label className="text-xs font-bold text-[#1e1b4b] block mb-2">Perfil de Acesso *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'cooperador', label: 'Cooperador' },
                    { value: 'auxiliar', label: 'Auxiliar' },
                    { value: 'pai', label: 'Pai/Responsável' },
                    { value: 'jovem', label: 'Jovem/Menor' }
                  ].map(perfil => (
                    <button
                      key={perfil.value}
                      onClick={() => setSelectedPerfil(perfil.value as Perfil)}
                      className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                        selectedPerfil === perfil.value 
                        ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-[#8b5cf6] hover:bg-purple-50'
                      }`}
                    >
                      {perfil.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              {itemSelecionado.situacao === 'vinculado' ? (
                <button
                  onClick={handleDesvincular}
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-bold flex items-center transition-colors"
                >
                  <Unlink size={16} className="mr-1.5" /> Desvincular
                </button>
              ) : (
                <div /> // Spacer
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-100 text-sm font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarVinculo}
                  className="px-5 py-2.5 rounded-xl bg-[#10b981] text-white text-sm font-bold shadow-sm hover:bg-emerald-600 transition-colors flex items-center"
                >
                  <CheckCircle size={16} className="mr-1.5" /> 
                  {itemSelecionado.situacao === 'vinculado' ? 'Salvar' : 'Aprovar'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
