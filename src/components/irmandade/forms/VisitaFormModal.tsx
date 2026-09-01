import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { ImagePicker } from './ImagePicker';
import type { Visita } from '../../../types';
import { useAppContext } from '../../../context/AppContext';

interface VisitaFormModalProps {
  familiaId: string;
  comunidadeId: string;
  onClose: () => void;
  onSave: (visita: Partial<Visita>) => Promise<void>;
  initialData?: Visita;
}

export const VisitaFormModal: React.FC<VisitaFormModalProps> = ({ familiaId, comunidadeId, onClose, onSave, initialData }) => {
  const { usuarioAtivo } = useAppContext();
  const [saving, setSaving] = useState(false);
  
  // Format current date to YYYY-MM-DDTHH:MM for datetime-local input
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const currentDateTime = now.toISOString().slice(0, 16);

  const [formData, setFormData] = useState<Partial<Visita>>(initialData || {
    familiaId,
    comunidadeId,
    dataVisita: currentDateTime,
    visitantes: [],
    moradoresPresentes: [],
    fotoVisitaUrl: '',
    observacoes: '',
    resultado: '',
    createdBy: usuarioAtivo?.id || 'anonimo'
  });

  const [visitantesInput, setVisitantesInput] = useState(initialData?.visitantes?.join(', ') || '');
  const [moradoresInput, setMoradoresInput] = useState(initialData?.moradoresPresentes?.join(', ') || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    if (!formData.dataVisita) {
      alert('Por favor, preencha a data e hora da visita.');
      return;
    }
    
    setSaving(true);
    try {
      const finalData = {
        ...formData,
        visitantes: visitantesInput.split(',').map(s => s.trim()).filter(Boolean),
        moradoresPresentes: moradoresInput.split(',').map(s => s.trim()).filter(Boolean),
      };
      await onSave(finalData);
    } catch (error) {
      console.error('Erro ao salvar visita:', error);
      alert('Erro ao salvar visita: ' + (error instanceof Error ? error.message : 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[120] flex flex-col justify-end">
      <div className="bg-[#fafafa] w-full h-[95%] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="bg-white px-5 pt-6 pb-4 rounded-t-3xl border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-[#1e1b4b]">Registrar Visita</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400" disabled={saving}>
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            
            {/* Foto (Selfie) */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <ImagePicker 
                label="FOTO DA VISITA (SELFIE)" 
                value={formData.fotoVisitaUrl} 
                onChange={(url) => setFormData(prev => ({ ...prev, fotoVisitaUrl: url }))}
                onClear={() => setFormData(prev => ({ ...prev, fotoVisitaUrl: '' }))}
              />
              <p className="text-[10px] text-gray-400 mt-1 leading-tight text-center">
                Tire uma selfie com a família para registrar este momento especial!
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Data e Hora *</label>
                <input 
                  type="datetime-local" name="dataVisita"
                  value={formData.dataVisita} onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Participantes (Irmãos que visitaram)</label>
                <input 
                  type="text"
                  value={visitantesInput} onChange={(e) => setVisitantesInput(e.target.value)}
                  placeholder="Ex: Ir. João, Ir. Pedro"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Moradores Presentes</label>
                <input 
                  type="text"
                  value={moradoresInput} onChange={(e) => setMoradoresInput(e.target.value)}
                  placeholder="Ex: Maria, José"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Observações / Assuntos Tratados</label>
                <textarea 
                  name="observacoes"
                  value={formData.observacoes} onChange={handleChange}
                  rows={4}
                  placeholder="Anotações sobre a visita..."
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
            className="w-full bg-[#10b981] text-white rounded-2xl py-3.5 font-bold flex items-center justify-center shadow-md active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Registrar Visita
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
