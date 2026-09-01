import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { ImagePicker } from './ImagePicker';
import { useAppContext } from '../../../context/AppContext';
import type { Familia } from '../../../types';

interface FamiliaFormModalProps {
  onClose: () => void;
  onSave: (familia: Partial<Familia>) => Promise<void>;
  initialData?: Familia;
}

export const FamiliaFormModal: React.FC<FamiliaFormModalProps> = ({ onClose, onSave, initialData }) => {
  const { comunidades } = useAppContext();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Familia>>(initialData || {
    nomeFamilia: '',
    comunidadeId: comunidades[0]?.id || '',
    telefonePrincipal: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Votuporanga',
    estado: 'SP',
    cep: '',
    latitude: undefined,
    longitude: undefined,
    observacoes: '',
    fotoFamiliaUrl: '',
    ativo: true,
    statusVisita: 'cinza'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    if (!formData.nomeFamilia || !formData.comunidadeId || !formData.endereco || !formData.numero || !formData.bairro || !formData.cidade || !formData.estado) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar família:', error);
      alert('Erro ao salvar família: ' + (error instanceof Error ? error.message : 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[110] flex flex-col justify-end">
      <div className="bg-[#fafafa] w-full h-[95%] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="bg-white px-5 pt-6 pb-4 rounded-t-3xl border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-[#1e1b4b]">{initialData ? 'Editar Família' : 'Nova Família'}</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400" disabled={saving}>
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            
            {/* Foto */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <ImagePicker 
                label="FOTO DA FAMÍLIA" 
                value={formData.fotoFamiliaUrl} 
                onChange={(url) => setFormData(prev => ({ ...prev, fotoFamiliaUrl: url }))}
                onClear={() => setFormData(prev => ({ ...prev, fotoFamiliaUrl: '' }))}
              />
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                Esta foto representará o grupo familiar (ex: foto de todos juntos). Não utilize fotos da fachada da casa.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nome da Família *</label>
                <input 
                  type="text" name="nomeFamilia"
                  value={formData.nomeFamilia} onChange={handleChange}
                  placeholder="Ex: Família Silva"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Comunidade *</label>
                <select 
                  name="comunidadeId"
                  value={formData.comunidadeId} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                >
                  {comunidades.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Telefone Principal</label>
                <input 
                  type="tel" name="telefonePrincipal"
                  value={formData.telefonePrincipal} onChange={handleChange}
                  placeholder="(17) 99999-9999"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#8b5cf6] mb-2 border-b border-purple-50 pb-2">Endereço</h3>
              
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">CEP</label>
                <input 
                  type="text" name="cep"
                  value={formData.cep} onChange={handleChange}
                  placeholder="00000-000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Logradouro *</label>
                  <input 
                    type="text" name="endereco"
                    value={formData.endereco} onChange={handleChange}
                    placeholder="Rua, Av..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Nº *</label>
                  <input 
                    type="text" name="numero"
                    value={formData.numero} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Complemento</label>
                <input 
                  type="text" name="complemento"
                  value={formData.complemento} onChange={handleChange}
                  placeholder="Apto, Bloco, Fundos..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Bairro *</label>
                <input 
                  type="text" name="bairro"
                  value={formData.bairro} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Cidade *</label>
                  <input 
                    type="text" name="cidade"
                    value={formData.cidade} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold text-gray-700 block mb-1">UF *</label>
                  <input 
                    type="text" name="estado" maxLength={2}
                    value={formData.estado} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Latitude</label>
                  <input 
                    type="number" step="any" name="latitude"
                    value={formData.latitude || ''} onChange={handleChange}
                    placeholder="-20.000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Longitude</label>
                  <input 
                    type="number" step="any" name="longitude"
                    value={formData.longitude || ''} onChange={handleChange}
                    placeholder="-49.000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
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
        <div className="bg-white p-4 border-t border-gray-100 shrink-0">
          <button 
            type="button"
            onClick={handleSalvar}
            disabled={saving}
            className="w-full bg-[#8b5cf6] text-white rounded-2xl py-3.5 font-bold flex items-center justify-center shadow-md active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Salvar Família
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
