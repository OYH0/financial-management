
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, DollarSign, LogOut, Shield, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTabPermissions } from '@/hooks/useTabPermissions';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { getMyTabVisibility } = useTabPermissions();

  const tabVisibility = getMyTabVisibility();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    ...(tabVisibility.companhia ? [{ id: 'companhia', label: 'Companhia do Churrasco', icon: Settings, path: '/companhia' }] : []),
    ...(tabVisibility.johnny ? [{ id: 'johnny', label: 'Johnny Rockets', icon: Settings, path: '/johnny' }] : []),
    { id: 'camerino', label: 'Camerino', icon: Building2, path: '/camerino' },
    { id: 'implementacao', label: 'Implementação', icon: Building2, path: '/implementacao' },
    ...(tabVisibility.despesas ? [{ id: 'despesas', label: 'Despesas', icon: DollarSign, path: '/despesas' }] : []),
    ...(tabVisibility.receitas ? [{ id: 'receitas', label: 'Receitas', icon: DollarSign, path: '/receitas' }] : []),
    { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/configuracoes' },
  ];

  const handleLogout = async () => {
    try {
      console.log('Logout button clicked');
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      // Force redirect if there's an error
      window.location.href = '/auth';
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-40" id="sidebar-overlay" style={{ display: 'none' }}></div>
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 text-white h-screen flex flex-col z-50 shadow-xl transform -translate-x-full lg:translate-x-0 transition-transform duration-300" id="sidebar">
        {/* Botão de fechar para mobile */}
        <div className="lg:hidden flex justify-end p-4">
          <button 
            onClick={() => {
              const sidebar = document.getElementById('sidebar');
              const overlay = document.getElementById('sidebar-overlay');
              sidebar?.classList.add('-translate-x-full');
              if (overlay) overlay.style.display = 'none';
            }}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 lg:p-6 border-b border-blue-500/30">
          <h1 className="text-lg lg:text-xl font-bold">Gestão Financeira</h1>
        </div>
        
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  // Fechar sidebar no mobile após navegar
                  const sidebar = document.getElementById('sidebar');
                  const overlay = document.getElementById('sidebar-overlay');
                  if (window.innerWidth < 1024) {
                    sidebar?.classList.add('-translate-x-full');
                    if (overlay) overlay.style.display = 'none';
                  }
                }}
                className={`w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl mb-1 lg:mb-2 text-left transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                    : 'hover:bg-white/10 text-blue-100 hover:text-white'
                }`}
              >
                <Icon size={16} className="lg:w-[18px] lg:h-[18px] flex-shrink-0" />
                <span className="text-xs lg:text-sm truncate">{item.label}</span>
              </button>
            );
          })}
          
          {tabVisibility.admin && (
            <button
              onClick={() => {
                navigate('/admin');
                // Fechar sidebar no mobile após navegar
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebar-overlay');
                if (window.innerWidth < 1024) {
                  sidebar?.classList.add('-translate-x-full');
                  if (overlay) overlay.style.display = 'none';
                }
              }}
              className={`w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl mb-1 lg:mb-2 text-left transition-all duration-200 ${
                location.pathname === '/admin'
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                  : 'hover:bg-white/10 text-blue-100 hover:text-white'
              }`}
            >
              <Shield size={16} className="lg:w-[18px] lg:h-[18px] flex-shrink-0" />
              <span className="text-xs lg:text-sm truncate">Admin</span>
            </button>
          )}
        </nav>
        
        <div className="p-3 lg:p-4 border-t border-blue-500/30">
          <div className="flex items-center gap-2 mb-3 lg:mb-4">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0"></div>
            <span className="text-xs lg:text-sm text-blue-100 truncate">{user?.email || 'Admin'}</span>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            size="sm" 
            className="w-full text-white border-white/30 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all duration-200 text-xs lg:text-sm h-8 lg:h-9"
            disabled={false}
          >
            <LogOut size={14} className="lg:w-4 lg:h-4 mr-1 lg:mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Botão de menu hambúrguer para mobile */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        onClick={() => {
          const sidebar = document.getElementById('sidebar');
          const overlay = document.getElementById('sidebar-overlay');
          sidebar?.classList.remove('-translate-x-full');
          if (overlay) overlay.style.display = 'block';
        }}
      >
        ☰
      </button>
    </>
  );
};

export default Sidebar;
