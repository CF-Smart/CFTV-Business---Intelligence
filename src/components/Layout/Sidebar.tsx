import React from 'react';
import { 
  Home, 
  Target, 
  FileText, 
  Upload, 
  BarChart3,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, onLogout, userName }) => {
  const { user } = useAuth();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'budget', label: 'Orçamento', icon: Target },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    // Só mostra a opção de importação para o admin
    ...(user && user.email === 'cfsmart@cfcontabilidade.com' ? [
      { id: 'import', label: 'Importação', icon: Upload }
    ] : [])
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen flex flex-col shadow-2xl">
      {/* Logo and Company Name */}
      <div className="p-4 border-b border-blue-700">
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-white p-2 rounded-lg shadow-md">
            <img 
              src="./logo cftv.jpg" 
              alt="CFTV Logo" 
              className="w-14 h-14 object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-sm font-bold leading-tight">Curitiba Segurança e Tecnologia</h1>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 shadow-lg transform scale-105' 
                    : 'hover:bg-blue-700 hover:transform hover:translate-x-1'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-700 space-y-3">
        <div className="flex items-center space-x-2 text-blue-300">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{userName}</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 text-blue-300 hover:text-white hover:bg-blue-700 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
        
        <div className="flex items-center space-x-2 pt-2">
          <BarChart3 className="w-4 h-4 text-blue-300" />
          <span className="text-xs text-blue-300">BI Dashboard v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;