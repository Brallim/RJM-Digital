import React, { useState } from 'react';
import { X, Save, Loader2, Trash2 } from 'lucide-react';
import { pessoaService } from '../../../services/pessoaService';
import { ImagePicker } from './ImagePicker';
import type { Pessoa } from '../../../types';

interface PessoaFormModalProps {
  onClose: () => void;
  onSave: (pessoa: Partial<Pessoa>) => Promise<void>;
  onDelete?: () => void;
  familiaId: string;
  comunidadeId: string;
  initialData?: Pessoa;
}

export const PessoaFormModal: React.FC<PessoaFormModalProps> = ({ onClose, onSave, onDelete, familiaId, comunidadeId, initialData }) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<Pessoa>>(initialData || {
    nomeCompleto: '',
    dataNascimento: '',
    sexo: 'M',
    parentesco: '',
    telefone: '',
    categoria: 'adulto',
    batizado: false,
    dataBatismo: '',
    isOrganista: false,
    isAuxiliar: false,
    dataApresentacao: '',
    observacoes: '',
    ativo: true,
    fotoUrl: '',
    familiaId,
    comunidadeId
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked,
        ...(name === 'batizado' && !checked ? { dataBatismo: null } : {})
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSalvar = async () => {
    if (!formData.nomeCompleto || !formData.dataNascimento || !formData.sexo || !formData.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }
    if (formData.batizado && !formData.dataBatismo) {
      alert('Por favor, preencha a data do batismo.');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar morador:', error);
      alert('Erro ao salvar morador: ' + (error instanceof Error ? error.message : 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    // Primeiro clique: mostra confirmação
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    // Segundo clique: executa a exclusão
    setDeleting(true);
    try {
      await pessoaService.delete(initialData.id);
      alert('Morador excluído com sucesso!');
      if (onDelete) {
        onDelete();
      } else {
        onClose();
      }
      // Recarrega os dados do app
      window.location.reload();
    } catch (error) {
      console.error('Erro ao deletar morador:', error);
      alert('Erro ao excluir morador: ' + (error instanceof Error ? error.message : 'Tente novamente.'));
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[120] flex flex-col justify-end">
      <div className="bg-[#fafafa] w-full h-[95%] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="bg-white px-5 pt-6 pb-4 rounded-t-3xl border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-[#1e1b4b]">{initialData ? 'Editar Morador' : 'Novo Morador'}</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400" disabled={saving}>
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            
            {/* Foto */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
              <ImagePicker 
                value={formData.fotoUrl} 
                onChange={(url) => setFormData(prev => ({ ...prev, fotoUrl: url }))}
                onClear={() => setFormData(prev => ({ ...prev, fotoUrl: '' }))}
              />
              <p className="text-[10px] text-gray-400 text-center leading-tight max-w-[200px]">
                Foto individual. Será utilizada na ficha e nos recitativos.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nome Completo *</label>
                <input 
                  type="text" name="nomeCompleto"
                  value={formData.nomeCompleto} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Nascimento *</label>
                  <input 
                    type="date" name="dataNascimento"
                    value={formData.dataNascimento} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Sexo *</label>
                  <select 
                    name="sexo"
                    value={formData.sexo} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Parentesco</label>
                  <input 
                    type="text" name="parentesco"
                    value={formData.parentesco} onChange={handleChange}
                    placeholder="Pai, Mãe, Filho..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Telefone</label>
                  <input 
                    type="tel" name="telefone"
                    value={formData.telefone} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Categoria *</label>
                <select 
                  name="categoria"
                  value={formData.categoria} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                >
                  <option value="menina">Menina</option>
                  <option value="moca">Moça</option>
                  <option value="menino">Menino</option>
                  <option value="moco">Moço</option>
                  <option value="adulto">Adulto</option>
                </select>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    name="batizado"
                    checked={formData.batizado}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${formData.batizado ? 'bg-[#10b981]' : 'bg-gray-200'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.batizado ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <span className="text-sm font-bold text-gray-700">Batizado(a)</span>
              </label>

              {formData.batizado && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Data do Batismo *</label>
                  <input 
                    type="date" name="dataBatismo"
                    value={formData.dataBatismo || ''} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
              )}
            </div>

            {formData.categoria === 'moca' && (
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex gap-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        name="isOrganista"
                        checked={formData.isOrganista || false}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isOrganista ? 'bg-[#10b981]' : 'bg-gray-200'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isOrganista ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">É Organista</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        name="isAuxiliar"
                        checked={formData.isAuxiliar || false}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isAuxiliar ? 'bg-[#10b981]' : 'bg-gray-200'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isAuxiliar ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">É Auxiliar</span>
                  </label>
                </div>

                {(formData.isOrganista || formData.isAuxiliar) && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Data de Apresentação</label>
                    <input 
                      type="date" name="dataApresentacao"
                      value={formData.dataApresentacao || ''} onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Observações Gerais</label>
                <textarea 
                  name="observacoes"
                  value={formData.observacoes} onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-white p-4 border-t border-gray-100 shrink-0 space-y-3">
          {confirmDelete && initialData?.id && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
              <p className="text-red-600 text-sm font-bold mb-2">
                Excluir {initialData.nomeCompleto}?
              </p>
              <p className="text-red-400 text-[11px] mb-3">Esta ação não pode ser desfeita.</p>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="flex-1 bg-gray-200 text-gray-700 rounded-xl py-2.5 font-bold text-sm active:scale-[0.98] transition-transform"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-red-500 text-white rounded-xl py-2.5 font-bold text-sm flex items-center justify-center active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {deleting ? (
                    <><Loader2 size={16} className="mr-1 animate-spin" /> Excluindo...</>
                  ) : (
                    <><Trash2 size={16} className="mr-1" /> Sim, excluir</>
                  )}
                </button>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            {initialData?.id && !confirmDelete && (
              <button 
                type="button"
                onClick={handleDelete}
                disabled={saving || deleting}
                className="px-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center shadow-sm active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                title="Excluir Morador"
              >
                <Trash2 size={20} />
              </button>
            )}
            
            <button 
              type="button"
              onClick={handleSalvar}
              disabled={saving || deleting || confirmDelete}
              className="flex-1 bg-[#8b5cf6] text-white rounded-2xl py-3.5 font-bold flex items-center justify-center shadow-md active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" /> Salvar Morador
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
