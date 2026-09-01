import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { Reuniao } from '../../types';
import { useAppContext } from '../../context/AppContext';

interface ReuniaoFormModalProps {
  comunidadeId: string;
  onClose: () => void;
  onSave: (reuniao: Partial<Reuniao>) => Promise<void>;
  initialData?: Reuniao;
}

export const ReuniaoFormModal: React.FC<ReuniaoFormModalProps> = ({ comunidadeId, onClose, onSave, initialData }) => {
  const { usuarioAtivo, pessoas } = useAppContext();
  const [saving, setSaving] = useState(false);
  
  // Formata data para o input datetime-local
  const formatForInput = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  // Pega o próximo domingo às 09:30
  const getNextSunday930 = () => {
    const d = new Date();
    if (d.getDay() === 0 && d.getHours() >= 10) {
      d.setDate(d.getDate() + 7); // Próximo domingo se já passou
    } else if (d.getDay() !== 0) {
      d.setDate(d.getDate() + (7 - d.getDay())); // Próximo domingo
    }
    d.setHours(9, 30, 0, 0);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<Partial<Reuniao>>({
    ...initialData,
    comunidadeId,
    data: initialData?.data ? formatForInput(initialData.data) : getNextSunday930(),
    status: initialData?.status || 'planejamento',
    auxiliarMeninas: '',
    trechoMeninas: '',
    auxiliarMocas: '',
    trechoMocas: '',
    auxiliarMeninos: '',
    trechoMeninos: '',
    auxiliarMocos: '',
    trechoMocos: '',
    oracaoPaiNosso: '',
    oracaoEspontanea: '',
    createdBy: usuarioAtivo?.id || 'anonimo'
  });

  // Auxiliares options (todas as congregações)
  const auxiliaresDeTodasAsComuns = pessoas.filter(p => p.isAuxiliar);
  const opcoesAuxiliares = auxiliaresDeTodasAsComuns.map(p => ({ value: p.nomeCompleto, label: p.nomeCompleto }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    if (!formData.data) {
      alert('Por favor, preencha a data e hora da reunião.');
      return;
    }
    
    setSaving(true);
    try {
      const payloadToSave = { ...formData };
      // Sempre garante que a data seja salva no formato UTC correto para o Supabase
      if (payloadToSave.data) {
        payloadToSave.data = new Date(payloadToSave.data).toISOString();
      }
      await onSave(payloadToSave);
    } catch (error) {
      console.error('Erro ao agendar reunião:', error);
      alert('Erro ao agendar reunião: ' + (error instanceof Error ? error.message : 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[120] flex flex-col justify-end">
      <div className="bg-[#fafafa] w-full h-[95%] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="bg-white px-5 pt-6 pb-4 rounded-t-3xl border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-[#1e1b4b]">{initialData ? 'Editar Agendamento' : 'Agendar Reunião'}</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400" disabled={saving}>
            <X size={20} />
          </button>
        </div>

        {/* Formulário */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Data e Hora */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Data e Hora da Reunião *</label>
              <input 
                type="datetime-local" name="data"
                value={formData.data} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Status</label>
              <select 
                name="status"
                value={formData.status} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
              >
                <option value="planejamento">Planejamento / Agendada</option>
                <option value="em_andamento">Em andamento</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
          </div>

          {/* Orações */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-[#1e1b4b] border-b border-gray-100 pb-2">Orações</h3>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Oração do Pai Nosso</label>
              <select 
                name="oracaoPaiNosso"
                value={formData.oracaoPaiNosso} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
              >
                <option value="">Selecione o auxiliar...</option>
                {opcoesAuxiliares.map(j => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Oração Espontânea</label>
              <select 
                name="oracaoEspontanea"
                value={formData.oracaoEspontanea} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
              >
                <option value="">Selecione o auxiliar...</option>
                {opcoesAuxiliares.map(j => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Escala de Recitativos */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-bold text-[#1e1b4b] border-b border-gray-100 pb-2">Escala de Recitativos</h3>
            
            {/* Meninas */}
            <div className="space-y-3 bg-[#fff0f6] p-3 rounded-xl border border-pink-100">
              <h4 className="font-bold text-[#ff007f] text-sm">Meninas</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-pink-700 block mb-1">Auxiliar Responsável</label>
                  <select 
                    name="auxiliarMeninas" 
                    value={formData.auxiliarMeninas} 
                    onChange={handleChange} 
                    className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#ff007f]"
                  >
                    <option value="">Selecione...</option>
                    {opcoesAuxiliares.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-pink-700 block mb-1">Trecho (Ex: Salmo 23)</label>
                  <input type="text" name="trechoMeninas" value={formData.trechoMeninas} onChange={handleChange} placeholder="Trecho Bíblico" className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#ff007f]" />
                </div>
              </div>
            </div>

            {/* Moças */}
            <div className="space-y-3 bg-[#f5f3ff] p-3 rounded-xl border border-purple-100">
              <h4 className="font-bold text-[#7c3aed] text-sm">Moças</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-purple-700 block mb-1">Auxiliar Responsável</label>
                  <select 
                    name="auxiliarMocas" 
                    value={formData.auxiliarMocas} 
                    onChange={handleChange} 
                    className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="">Selecione...</option>
                    {opcoesAuxiliares.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-purple-700 block mb-1">Trecho Bíblico</label>
                  <input type="text" name="trechoMocas" value={formData.trechoMocas} onChange={handleChange} placeholder="Trecho Bíblico" className="w-full bg-white border border-purple-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#7c3aed]" />
                </div>
              </div>
            </div>

            {/* Meninos */}
            <div className="space-y-3 bg-[#f0f9ff] p-3 rounded-xl border border-blue-100">
              <h4 className="font-bold text-[#0ea5e9] text-sm">Meninos</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-blue-700 block mb-1">Auxiliar Responsável</label>
                  <select 
                    name="auxiliarMeninos" 
                    value={formData.auxiliarMeninos} 
                    onChange={handleChange} 
                    className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#0ea5e9]"
                  >
                    <option value="">Selecione...</option>
                    {opcoesAuxiliares.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-700 block mb-1">Trecho Bíblico</label>
                  <input type="text" name="trechoMeninos" value={formData.trechoMeninos} onChange={handleChange} placeholder="Trecho Bíblico" className="w-full bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#0ea5e9]" />
                </div>
              </div>
            </div>

            {/* Moços */}
            <div className="space-y-3 bg-[#ecfdf5] p-3 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-[#10b981] text-sm">Moços</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-emerald-700 block mb-1">Auxiliar Responsável</label>
                  <select 
                    name="auxiliarMocos" 
                    value={formData.auxiliarMocos} 
                    onChange={handleChange} 
                    className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#10b981]"
                  >
                    <option value="">Selecione...</option>
                    {opcoesAuxiliares.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-700 block mb-1">Trecho Bíblico</label>
                  <input type="text" name="trechoMocos" value={formData.trechoMocos} onChange={handleChange} placeholder="Trecho Bíblico" className="w-full bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#10b981]" />
                </div>
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
                <Save size={18} className="mr-2" /> Agendar Reunião
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
