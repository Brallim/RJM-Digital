import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface AvisoFormModalProps {
  onClose: () => void;
  onSave: (titulo: string, conteudo: string) => Promise<void>;
}

export const AvisoFormModal: React.FC<AvisoFormModalProps> = ({ onClose, onSave }) => {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSalvar = async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      alert('Por favor, preencha o título e a mensagem do aviso.');
      return;
    }
    setSaving(true);
    try {
      await onSave(titulo, conteudo);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar aviso.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 animate-in fade-in">
      <div className="bg-[#fafafa] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95">
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <h2 className="text-lg font-bold text-[#1e1b4b]">Novo Aviso</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Título *</label>
              <input 
                type="text" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Ensaio Regional"
                maxLength={40}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Mensagem *</label>
              <textarea 
                value={conteudo} 
                onChange={e => setConteudo(e.target.value)}
                rows={4}
                placeholder="Detalhes do aviso..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border-t border-gray-100 sticky bottom-0 z-10 shrink-0">
          <button 
            onClick={handleSalvar}
            disabled={saving}
            className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-purple-200 flex items-center justify-center disabled:opacity-70"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Publicar Aviso
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
