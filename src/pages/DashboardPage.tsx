import React from 'react';
import { useAppContext } from '../context/AppContext';
import { CasaOracaoIllustration } from '../components/dashboard/CasaOracaoIllustration';
import { CalendarDays, Users, MapPin, ChevronRight, Bell, LogOut, Megaphone, HeartHandshake, User, Plus, ThumbsUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RecitativosSection } from '../components/recitativos/RecitativosSection';
import { avisoService } from '../services/avisoService';
import type { Aviso } from '../types';
import { AvisoFormModal } from '../components/dashboard/AvisoFormModal';

export const DashboardPage: React.FC = () => {
  const { usuarioAtivo, comunidadeAtiva, pessoas, reunioes } = useAppContext();
  const [avisos, setAvisos] = React.useState<Aviso[]>([]);
  const [loadingAvisos, setLoadingAvisos] = React.useState(true);
  const [showAvisoModal, setShowAvisoModal] = React.useState(false);
  const isCooperador = usuarioAtivo?.perfil === 'cooperador';

  const fetchAvisos = async () => {
    if (!comunidadeAtiva || !usuarioAtivo) return;
    try {
      const data = await avisoService.getAvisos(comunidadeAtiva.id, usuarioAtivo.id);
      setAvisos(data);
    } catch (error) {
      console.error('Erro ao buscar avisos', error);
    } finally {
      setLoadingAvisos(false);
    }
  };

  React.useEffect(() => {
    fetchAvisos();
  }, [comunidadeAtiva, usuarioAtivo]);

  const handleSaveAviso = async (titulo: string, conteudo: string) => {
    if (!comunidadeAtiva || !usuarioAtivo) return;
    await avisoService.createAviso({
      comunidadeId: comunidadeAtiva.id,
      titulo,
      conteudo,
      autorId: usuarioAtivo.id,
    });
    setShowAvisoModal(false);
    fetchAvisos();
  };

  const handleToggleLido = async (avisoId: string, currentlyLido: boolean) => {
    if (!usuarioAtivo) return;
    // Optimistic update
    setAvisos(prev => prev.map(a => {
      if (a.id === avisoId) {
        return {
          ...a,
          lidoPorMim: !currentlyLido,
          totalLidos: currentlyLido ? (a.totalLidos || 0) - 1 : (a.totalLidos || 0) + 1
        };
      }
      return a;
    }));

    try {
      await avisoService.toggleLido(avisoId, usuarioAtivo.id, currentlyLido);
    } catch (error) {
      console.error('Erro ao alternar lido', error);
      fetchAvisos(); // Revert on error
    }
  };

  // Encontra a reunião mais recente ou agendada para a comunidade ativa
  const reuniaoAtual = reunioes
    .filter(r => r.comunidadeId === comunidadeAtiva?.id && (r.status === 'planejamento' || r.status === 'preparada'))
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];

  const calculateDaysLeft = (dateString?: string) => {
    if (!dateString) return null;
    const meetingDate = new Date(dateString);
    meetingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = meetingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  };

  const diasRestantes = calculateDaysLeft(reuniaoAtual?.data);

  // Filtrar pessoas da comunidade atual
  const pessoasDaComunidade = pessoas.filter(p => p.comunidadeId === comunidadeAtiva?.id);

  // Calcular estatísticas
  const numMeninas = pessoasDaComunidade.filter(p => p.categoria === 'menina').length;
  const numMocas = pessoasDaComunidade.filter(p => p.categoria === 'moca').length;
  const numMeninos = pessoasDaComunidade.filter(p => p.categoria === 'menino').length;
  const numMocos = pessoasDaComunidade.filter(p => p.categoria === 'moco').length;
  const totalGeral = numMeninas + numMocas + numMeninos + numMocos;

  const getRoleLabel = (perfil?: string) => {
    switch (perfil) {
      case 'cooperador': return 'Cooperador de Jovens e Menores';
      case 'auxiliar': return 'Auxiliar de Jovens e Menores';
      case 'pai': return 'Pai / Mãe';
      case 'jovem': return 'Jovem / Menor';
      default: return 'Irmandade';
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <div className="p-4 space-y-0 animate-in fade-in duration-500 pb-28 bg-[#fafafa]">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <button 
          onClick={handleLogout}
          className="p-1.5 rounded-full text-[#8b5cf6] bg-purple-50 hover:bg-purple-100 transition-colors"
          title="Sair do aplicativo"
        >
          <LogOut size={24} />
        </button>
        <div className="text-center flex-1 px-4 flex flex-col items-center">
          <h1 className="text-[15px] font-bold text-[#1e1b4b] leading-tight truncate w-full max-w-[200px]">
            {usuarioAtivo?.nome || 'Irmão(ã)'}
          </h1>
          <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded-full mt-0.5">
            {getRoleLabel(usuarioAtivo?.perfil)}
          </span>
        </div>
        <div className="relative">
          <div className="p-1.5 border border-[#8b5cf6]/30 rounded-full text-[#8b5cf6]">
            <Bell size={20} />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ec4899] rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white">3</span>
        </div>
      </header>



      {/* Greeting and Illustration */}
      <div className="relative bg-gradient-to-br from-[#f5f3ff] to-[#faf5ff] rounded-3xl p-5 mb-5 overflow-hidden flex items-center justify-between shadow-sm border border-purple-50 min-h-[150px]">
        <div className="z-10 w-[55%]">
          <h2 className="text-2xl font-bold text-[#1e1b4b] mb-2 leading-tight">A paz de Deus,</h2>
          <p className="text-xs text-gray-600 leading-relaxed">Que hoje seja mais um dia de bênçãos e aprendizado. <span className="text-[#ec4899] text-sm">❤</span></p>
        </div>
        <div className="absolute right-0 bottom-0 w-[170px] flex items-end justify-end">
          <CasaOracaoIllustration className="bg-transparent border-0 shadow-none w-full" />
        </div>
      </div>

      {/* Next Meeting Card */}
      {reuniaoAtual && diasRestantes !== null && (
        <div className="bg-white rounded-3xl p-4 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-50 flex items-center justify-between mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-[#fdf2f8] rounded-2xl flex items-center justify-center text-[#ec4899] shrink-0">
              <CalendarDays size={26} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-bold text-[#1e1b4b] text-[15px]">Próxima reunião</h3>
              <p className="text-[13px] font-bold text-[#ec4899] mt-0.5 capitalize">
                {new Date(reuniaoAtual.data).toLocaleDateString('pt-BR', { weekday: 'long' })} • {new Date(reuniaoAtual.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Reunião de Jovens e Menores</p>
              <div className="flex items-center text-[11px] text-gray-500 mt-1">
                <MapPin size={12} className="text-[#8b5cf6] mr-1" />
                <span className="truncate max-w-[120px]">{comunidadeAtiva?.nome}</span>
              </div>
            </div>
          </div>
          <div className="text-center bg-[#fdf2f8] px-3 py-2.5 rounded-2xl flex flex-col justify-center min-w-[70px] shrink-0 ml-2">
            <span className="text-[10px] text-[#ec4899] font-bold mb-0.5">{diasRestantes === 0 ? 'É' : 'Faltam'}</span>
            <span className="text-3xl font-black text-[#ec4899] leading-none mb-1">
              {diasRestantes === 0 ? 'Hoje' : diasRestantes}
            </span>
            {diasRestantes > 0 && <span className="text-[10px] text-[#ec4899] font-bold">{diasRestantes === 1 ? 'dia' : 'dias'}</span>}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="mb-6">
        {/* Grid de 4 categorias */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {/* Meninas */}
          <div className="bg-[#fff0f6] rounded-3xl p-2 flex flex-col items-center justify-center border border-pink-100 shadow-sm h-[100px]">
            <User size={20} className="text-[#ff007f] mb-1" />
            <span className="text-xl font-black text-[#ff007f] leading-none mb-1">{numMeninas}</span>
            <span className="text-[9px] text-[#ff007f] font-bold text-center leading-[1.1]">Meninas<br/>Cadastradas</span>
          </div>
          {/* Moças */}
          <div className="bg-[#f5f3ff] rounded-3xl p-2 flex flex-col items-center justify-center border border-purple-100 shadow-sm h-[100px]">
            <User size={20} className="text-[#7c3aed] mb-1" />
            <span className="text-xl font-black text-[#7c3aed] leading-none mb-1">{numMocas}</span>
            <span className="text-[9px] text-[#7c3aed] font-bold text-center leading-[1.1]">Moças<br/>Cadastradas</span>
          </div>
          {/* Meninos */}
          <div className="bg-[#f0f9ff] rounded-3xl p-2 flex flex-col items-center justify-center border border-blue-100 shadow-sm h-[100px]">
            <User size={20} className="text-[#0ea5e9] mb-1" />
            <span className="text-xl font-black text-[#0ea5e9] leading-none mb-1">{numMeninos}</span>
            <span className="text-[9px] text-[#0ea5e9] font-bold text-center leading-[1.1]">Meninos<br/>Cadastrados</span>
          </div>
          {/* Moços */}
          <div className="bg-[#ecfdf5] rounded-3xl p-2 flex flex-col items-center justify-center border border-emerald-100 shadow-sm h-[100px]">
            <User size={20} className="text-[#10b981] mb-1" />
            <span className="text-xl font-black text-[#10b981] leading-none mb-1">{numMocos}</span>
            <span className="text-[9px] text-[#10b981] font-bold text-center leading-[1.1]">Moços<br/>Cadastrados</span>
          </div>
        </div>

        {/* Total Rectangle */}
        <div className="bg-[#f2f4ff] rounded-[24px] p-3 flex items-center justify-between border border-blue-100 shadow-sm">
          <div className="flex items-center space-x-3 pl-1">
            <div className="w-[38px] h-[38px] bg-[#e0e7ff] rounded-full flex items-center justify-center text-[#5468ff]">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[15px] text-[#5468ff] font-black tracking-wide uppercase">Total Geral</p>
            </div>
          </div>
          <div className="pr-3">
            <span className="text-[28px] font-black text-[#5468ff]">{totalGeral}</span>
          </div>
        </div>
      </div>

      {/* Avisos */}
      {(!loadingAvisos && (avisos.length > 0 || isCooperador)) && (
        <div className="bg-white rounded-3xl p-4.5 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-50 mb-5 p-4 relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Megaphone className="text-[#8b5cf6]" size={22} />
              <h3 className="font-bold text-[#1e1b4b] text-[15px]">Avisos</h3>
            </div>
            {isCooperador && (
              <button 
                onClick={() => setShowAvisoModal(true)}
                className="bg-purple-50 text-[#8b5cf6] p-1.5 rounded-full hover:bg-purple-100 transition-colors"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          
          {avisos.length === 0 ? (
            <div className="text-center py-6">
              <Megaphone className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-500">Nenhum aviso publicado.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {avisos.slice(0, 3).map((aviso) => (
                <li key={aviso.id} className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 flex items-start justify-between">
                  <div className="flex-1 pr-3">
                    <h4 className="text-[14px] font-bold text-[#1e1b4b] leading-tight mb-1">{aviso.titulo}</h4>
                    <p className="text-[12px] text-gray-600 leading-snug mb-2">{aviso.conteudo}</p>
                    <div className="text-[10px] text-gray-400 font-medium">
                      Por {aviso.autorNome} • {new Date(aviso.dataPublicacao).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleLido(aviso.id, !!aviso.lidoPorMim)}
                    className={`flex flex-col items-center justify-center shrink-0 w-[42px] h-[42px] rounded-xl transition-colors border ${
                      aviso.lidoPorMim 
                        ? 'bg-purple-50 border-purple-200 text-[#8b5cf6]' 
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <ThumbsUp size={16} className={aviso.lidoPorMim ? 'fill-current' : ''} />
                    <span className="text-[10px] font-bold mt-0.5">{aviso.totalLidos || 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {avisos.length > 3 && (
            <div className="mt-3 text-center border-t border-gray-100 pt-3">
              <button className="text-[12px] text-[#8b5cf6] font-bold hover:underline">
                Ver todos os {avisos.length} avisos
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recitativos Component */}
      <RecitativosSection />

      {showAvisoModal && (
        <AvisoFormModal 
          onClose={() => setShowAvisoModal(false)}
          onSave={handleSaveAviso}
        />
      )}

      {/* Footer Banner */}
      <div className="bg-[#ecfdf5] rounded-3xl p-4 shadow-sm flex items-center justify-between cursor-pointer mt-5">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#10b981] flex items-center justify-center text-[#10b981] shrink-0 bg-transparent">
            <HeartHandshake size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[#10b981] text-[15px]">Participe com alegria!</h3>
            <p className="text-[12px] text-[#065f46]">Servir a Deus juntos é uma bênção.</p>
          </div>
        </div>
        <ChevronRight size={24} className="text-[#10b981]" />
      </div>

    </div>
  );
};
