import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Comunidade, Usuario, Familia, Pessoa, Visita, Reuniao } from '../types';
import { mockComunidades } from '../mock';
import { supabase } from '../lib/supabase';

interface AppContextType {
  usuarioAtivo: Usuario | null;
  setUsuarioAtivo: (user: Usuario | null) => void;
  comunidadeAtiva: Comunidade | null;
  setComunidadeAtiva: (comunidade: Comunidade) => void;
  comunidades: Comunidade[];
  familias: Familia[];
  pessoas: Pessoa[];
  visitas: Visita[];
  reunioes: Reuniao[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarioAtivo, setUsuarioAtivo] = useState<Usuario | null>(null);
  
  // Inicializa com o localStorage ou o primeiro mock
  const [comunidadeAtiva, setComunidadeAtivaState] = useState<Comunidade | null>(() => {
    const saved = localStorage.getItem('comunidadeAtivaId');
    if (saved) {
      const found = mockComunidades.find(c => c.id === saved);
      if (found) return found;
    }
    return mockComunidades[0];
  });
  
  const setComunidadeAtiva = (comunidade: Comunidade) => {
    setComunidadeAtivaState(comunidade);
    localStorage.setItem('comunidadeAtivaId', comunidade.id);
  };
  
  const [loading, setLoading] = useState(true);
  
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);

  useEffect(() => {
    // 1. Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserSession(session?.user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session?.user);
    });

    const handleUserSession = async (authUser: any) => {
      if (!authUser) {
        setUsuarioAtivo(null);
        setLoading(false);
        return;
      }

      // Fetch user profile from `usuarios` table
      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (userData) {
        setUsuarioAtivo(userData as Usuario);
      } else {
        // If they just signed up, they might not be in the usuarios table yet
        setUsuarioAtivo({
          id: authUser.id,
          nome: authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email,
          perfil: 'pendente',
          comunidadesPermitidas: [],
          ativo: false
        } as Usuario);
      }
      setLoading(false);
    };

    // 2. Fetch initial data
    const fetchInitialData = async () => {
      const { data: fData, error: fError } = await supabase
        .from('familias')
        .select('*')
        .eq('ativo', true);
        
      if (!fError && fData) setFamilias(fData as Familia[]);

      const { data: pData, error: pError } = await supabase
        .from('pessoas')
        .select('*')
        .eq('ativo', true);
        
      if (!pError && pData) setPessoas(pData as Pessoa[]);
      
      const { data: vData, error: vError } = await supabase
        .from('visitas')
        .select('*');
        
      if (!vError && vData) setVisitas(vData as Visita[]);
      
      const { data: rData, error: rError } = await supabase
        .from('reunioes')
        .select('*');
        
      if (!rError && rData) setReunioes(rData as Reuniao[]);
    };

    fetchInitialData();

    // 2. Setup Realtime Subscriptions
    const familiasChannel = supabase.channel('public:familias')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'familias' }, payload => {
        if (payload.eventType === 'INSERT') {
          setFamilias(prev => [...prev, payload.new as Familia]);
        } else if (payload.eventType === 'UPDATE') {
          setFamilias(prev => prev.map(f => f.id === payload.new.id ? payload.new as Familia : f));
        } else if (payload.eventType === 'DELETE') {
          setFamilias(prev => prev.filter(f => f.id !== payload.old.id));
        }
      })
      .subscribe();

    const pessoasChannel = supabase.channel('public:pessoas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pessoas' }, payload => {
        if (payload.eventType === 'INSERT') {
          setPessoas(prev => [...prev, payload.new as Pessoa]);
        } else if (payload.eventType === 'UPDATE') {
          setPessoas(prev => prev.map(p => p.id === payload.new.id ? payload.new as Pessoa : p));
        } else if (payload.eventType === 'DELETE') {
          setPessoas(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();
      
    const visitasChannel = supabase.channel('public:visitas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitas' }, payload => {
        if (payload.eventType === 'INSERT') {
          setVisitas(prev => [...prev, payload.new as Visita]);
        } else if (payload.eventType === 'UPDATE') {
          setVisitas(prev => prev.map(v => v.id === payload.new.id ? payload.new as Visita : v));
        } else if (payload.eventType === 'DELETE') {
          setVisitas(prev => prev.filter(v => v.id !== payload.old.id));
        }
      })
      .subscribe();
      
    const reunioesChannel = supabase.channel('public:reunioes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reunioes' }, payload => {
        if (payload.eventType === 'INSERT') {
          setReunioes(prev => [...prev, payload.new as Reuniao]);
        } else if (payload.eventType === 'UPDATE') {
          setReunioes(prev => prev.map(r => r.id === payload.new.id ? payload.new as Reuniao : r));
        } else if (payload.eventType === 'DELETE') {
          setReunioes(prev => prev.filter(r => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(familiasChannel);
      supabase.removeChannel(pessoasChannel);
      supabase.removeChannel(visitasChannel);
      supabase.removeChannel(reunioesChannel);
    };
  }, []);

  return (
    <AppContext.Provider value={{
      usuarioAtivo, setUsuarioAtivo,
      comunidadeAtiva, setComunidadeAtiva,
      comunidades: mockComunidades,
      familias,
      pessoas,
      visitas,
      reunioes
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
