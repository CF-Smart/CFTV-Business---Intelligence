import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [error, setError] = useState<string | null>(null);

  // Verificar se há um usuário logado no localStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('cftv_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      // Simular validação de login
      // Em produção, isso seria uma chamada para API
      const validUsers = [
        { id: '1', email: 'financeirocftv1@cfcontabilidade.com', password: 'CFTV@1234', name: 'Financeiro CFTV 1' },
        { id: '2', email: 'financeirocftv2@cfcontabilidade.com', password: 'CFTV@1234', name: 'Financeiro CFTV 2' },
        { id: '3', email: 'financeirocftv3@cfcontabilidade.com', password: 'CFTV@1234', name: 'Financeiro CFTV 3' },
        { id: 'admin', email: 'cfsmart@cfcontabilidade.com', password: 'soubotafogo', name: 'CF Smart' }
      ];

      const user = validUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        const userData = { id: user.id, email: user.email, name: user.name };
        localStorage.setItem('cftv_user', JSON.stringify(userData));
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
        return true;
      } else {
        setError('Email ou senha incorretos');
        return false;
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('cftv_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setError(null);
    
    try {
      // Simular envio de email
      // Em produção, isso seria uma chamada para API
      console.log(`Enviando nova senha para: ${email}`);
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      setError('Erro ao enviar email. Tente novamente.');
      return false;
    }
  };

  return {
    ...authState,
    error,
    login,
    logout,
    forgotPassword
  };
};