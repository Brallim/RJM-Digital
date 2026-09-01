import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, KeyRound, Mail, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { usuarioAtivo } = useAppContext();

  React.useEffect(() => {
    if (usuarioAtivo) {
      navigate('/', { replace: true });
    }
  }, [usuarioAtivo, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          // Add to usuarios table as pendente
          await supabase.from('usuarios').insert({
            id: data.user.id,
            email: data.user.email,
            nome: nome,
            perfil: 'pendente',
            ativo: false
          });
        }
        
        alert('Cadastro realizado! O Cooperador precisa aprovar seu acesso para você entrar.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Auth erro:', error);
      alert(error.message || 'Erro ao realizar autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        <div className="relative p-8 text-center overflow-hidden min-h-[220px] flex flex-col items-center justify-center">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{ backgroundImage: "url('/igreja.png')" }}
          ></div>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-[#1e1b4b]/70 z-10"></div>
          
          <div className="relative z-20 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30 shadow-lg">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="relative z-20 text-3xl font-bold text-white mb-1 drop-shadow-md">RJM Digital</h1>
          <p className="relative z-20 text-purple-100 text-sm font-medium drop-shadow-md">Gestão de Jovens e Famílias</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-[#1e1b4b] mb-6">
            {isSignUp ? 'Criar sua conta' : 'Acesse sua conta'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Seu Nome</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                    placeholder="João Silva"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound size={16} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-[#8b5cf6] focus:bg-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10b981] text-white rounded-xl py-3.5 mt-2 font-bold flex items-center justify-center shadow-md active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={18} className="mr-2 animate-spin" /> Aguarde...</>
              ) : (
                <>{isSignUp ? 'Cadastrar' : 'Entrar'}</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-[#8b5cf6] hover:underline"
            >
              {isSignUp ? 'Já tenho uma conta. Entrar' : 'Criar uma nova conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
