
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import DespesasPage from "./pages/DespesasPage";
import ReceitasPage from "./pages/ReceitasPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import CamerinoPage from "./pages/CamerinoPage";
import CompanhiaPage from "./pages/CompanhiaPage";
import JohnnyPage from "./pages/JohnnyPage";
import ImplementacaoPage from "./pages/ImplementacaoPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

console.log('App.tsx loading...');

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering...');
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="/despesas" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <DespesasPage />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="/receitas" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <ReceitasPage />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="/relatorios" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <RelatoriosPage />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="/configuracoes" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <ConfiguracoesPage />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="/camerino" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <CamerinoPage />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="/companhia" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <CompanhiaPage />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="/johnny" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <JohnnyPage />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="/implementacao" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <ImplementacaoPage />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="/admin" element={
                  <div className="main-content">
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  </div>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return <div>Error loading application</div>;
  }
};

export default App;
