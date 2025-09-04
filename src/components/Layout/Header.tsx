import React from 'react';
import { Users, Download, Search, Calendar } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  selectedPeriod: string;
  selectedClient: string;
  onPeriodChange: (period: string) => void;
  onClientChange: (client: string) => void;
  availablePeriods: Array<{ value: string; label: string }>;
  availableClients: Array<{ value: string; label: string }>;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  selectedClient, 
  onClientChange,
  availableClients,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const pageNames = {
    dashboard: 'Dashboard',
    budget: 'Orçamento',
    reports: 'Relatórios',
    import: 'Importação'
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {pageNames[currentPage as keyof typeof pageNames]}
          </h1>
          <p className="text-gray-600">Painel de Business Intelligence</p>
        </div>
        
        {currentPage !== 'import' && (
          <div className="flex items-center space-x-4">
            {/* Date Range Filter */}
            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <span className="text-gray-400 mt-4">até</span>
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">Data Final</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Client Filter */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div className="relative">
                <select
                  value={selectedClient}
                  onChange={(e) => onClientChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[250px] appearance-none pr-8"
                  disabled={availableClients.length <= 1}
                >
                  {availableClients.map((client) => (
                    <option key={client.value} value={client.value}>
                      {client.label}
                    </option>
                  ))}
                </select>
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Export Button */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;