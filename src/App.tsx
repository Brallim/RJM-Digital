import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FamiliasPage } from './pages/FamiliasPage';
import { JovensPage } from './pages/Placeholders';
import { IrmandadePage } from './pages/IrmandadePage';
import { AuxiliaresPage } from './pages/AuxiliaresPage';
import { AdminAprovacaoPage } from './pages/AdminAprovacaoPage';
import { Clock } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { usuarioAtivo } = useAppContext();
  
  if (!usuarioAtivo) return <Navigate to="/login" />;
  
  if (usuarioAtivo.perfil === 'pendente') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
        <Clock size={48} className="text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-[#1e1b4b] mb-2">Aguardando Aprovação</h2>
        <p className="text-gray-500">Seu cadastro foi recebido. Um cooperador precisa aprovar e definir seu acesso antes que você possa entrar no aplicativo.</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(usuarioAtivo.perfil)) {
    return <Navigate to="/" />; // Redirect to dashboard if not allowed
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        
        {/* Somente cooperador e auxiliar acessam Familias e Irmandade */}
        {/* Somente cooperador e auxiliar acessam Familias e Irmandade */}
        <Route path="familias" element={<ProtectedRoute allowedRoles={['cooperador', 'auxiliar']}><FamiliasPage /></ProtectedRoute>} />
        <Route path="irmandade" element={<ProtectedRoute allowedRoles={['cooperador', 'auxiliar']}><IrmandadePage /></ProtectedRoute>} />
        <Route path="auxiliares" element={<ProtectedRoute allowedRoles={['cooperador', 'auxiliar']}><AuxiliaresPage /></ProtectedRoute>} />
        
        {/* Apenas Cooperador */}
        <Route path="admin" element={<ProtectedRoute allowedRoles={['cooperador']}><AdminAprovacaoPage /></ProtectedRoute>} />
        
        <Route path="jovens" element={<JovensPage />} />
        <Route path="mais" element={<div className="p-4"><h1 className="text-xl font-bold text-primary">Mais</h1><p className="text-gray-500">Opções extras (famílias, jovens etc.)</p></div>} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
