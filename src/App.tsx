import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useDataStore } from './hooks/useDataStore';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Import from './pages/Import';

const App: React.FC = () => {
  const { user, login, logout, forgotPassword } = useAuth();
  const { getAvailablePeriods, getAvailableClients } = useDataStore();
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const availablePeriods = getAvailablePeriods();
  const [availableClients, setAvailableClients] = useState([{ value: 'all', label: 'Todos os Clientes' }]);

  // Carregar clientes do Supabase
  React.useEffect(() => {
    const loadClients = async () => {
      try {
        const clients = await getAvailableClients();
        setAvailableClients(clients);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    };
    loadClients();
  }, []);

  // Update selected period if current selection is no longer available
  React.useEffect(() => {
    if (selectedPeriod !== 'all' && !availablePeriods.find(p => p.value === selectedPeriod)) {
      setSelectedPeriod('all');
    }
  }, [availablePeriods, selectedPeriod]);

  // Update selected client if current selection is no longer available
  React.useEffect(() => {
    if (selectedClient !== 'all' && !availableClients.find(c => c.value === selectedClient)) {
      setSelectedClient('all');
    }
  }, [availableClients, selectedClient]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard selectedClient={selectedClient} startDate={startDate} endDate={endDate} />;
      case 'budget':
        return <Budget selectedPeriod={selectedPeriod} selectedClient={selectedClient} />;
      case 'reports':
        return <Reports selectedPeriod={selectedPeriod} selectedClient={selectedClient} />;
      case 'import':
        return <Import />;
      default:
        return <Dashboard selectedClient={selectedClient} startDate={startDate} endDate={endDate} />;
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('dashboard'); // Garante que ao logar de novo, caia no dashboard
  };

  if (!user) {
    return <LoginForm onLogin={login} onForgotPassword={forgotPassword} isLoading={false} error={null} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        userName={user.name}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentPage={currentPage}
          selectedPeriod={selectedPeriod}
          selectedClient={selectedClient}
          onPeriodChange={setSelectedPeriod}
          onClientChange={setSelectedClient}
          availablePeriods={availablePeriods}
          availableClients={availableClients}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;