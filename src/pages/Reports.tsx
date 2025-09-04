import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ReportsProps {
  selectedPeriod: string;
  selectedClient: string;
}

const Reports: React.FC<ReportsProps> = (props) => {
  const { user } = useAuth();
  
  // TODOS OS HOOKS DEVEM VIR ANTES DE QUALQUER RETURN CONDICIONAL
  const [selectedReport, setSelectedReport] = useState('financial');
  
  // Só permite acesso para o admin CF Smart
  if (!user || user.email !== 'cfsmart@cfcontabilidade.com') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Em desenvolvimento</h2>
          <p>Em desenvolvimento, agradecemos a compreensão :)</p>
        </div>
      </div>
    );
  }

  const reports = [
    { id: 'financial', name: 'Relatório Financeiro', description: 'Faturamento, despesas e resultado' },
    { id: 'clients', name: 'Relatório de Clientes', description: 'Performance por cliente' },
    { id: 'services', name: 'Relatório de Serviços', description: 'Análise de serviços prestados' },
    { id: 'contracts', name: 'Relatório de Contratos', description: 'Situação dos contratos ativos' }
  ];

  const financialData: any[] = [];

  const clientData: any[] = [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderFinancialReport = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h3 className="text-xl font-bold">Relatório Financeiro Detalhado</h3>
        <p className="text-blue-100">Período: Janeiro - Março 2024</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Categoria</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Janeiro</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Fevereiro</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Março</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            {financialData.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{row.category}</td>
                <td className={`px-6 py-4 text-right font-medium ${row.jan > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(row.jan)}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${row.fev > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(row.fev)}
                </td>
                <td className={`px-6 py-4 text-right font-medium ${row.mar > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(row.mar)}
                </td>
                <td className={`px-6 py-4 text-right font-bold ${row.total > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(row.total)}
                </td>
              </tr>
            ))}
            {financialData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">Nenhum dado financeiro disponível</p>
                    <p className="text-sm">Importe arquivos para gerar relatórios</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClientReport = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <h3 className="text-xl font-bold">Relatório de Performance por Cliente</h3>
        <p className="text-green-100">Período: Janeiro - Março 2024</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Cliente</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Janeiro</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Fevereiro</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Março</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            {clientData.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{row.client}</td>
                <td className="px-6 py-4 text-right font-medium text-green-600">{formatCurrency(row.jan)}</td>
                <td className="px-6 py-4 text-right font-medium text-green-600">{formatCurrency(row.fev)}</td>
                <td className="px-6 py-4 text-right font-medium text-green-600">{formatCurrency(row.mar)}</td>
                <td className="px-6 py-4 text-right font-bold text-green-700">{formatCurrency(row.total)}</td>
              </tr>
            ))}
            {clientData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">Nenhum dado de cliente disponível</p>
                    <p className="text-sm">Importe arquivos para gerar relatórios por cliente</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  try {
    return (
      <div className="space-y-6">
        {/* Report Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Central de Relatórios</h1>
              <p className="text-gray-600">Acesse relatórios detalhados do seu negócio</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Receita Total</h3>
          <p className="text-2xl font-bold">R$ 0,00</p>
          <span className="text-xs opacity-75">Aguardando dados</span>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <Filter className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Margem Bruta</h3>
          <p className="text-2xl font-bold">0%</p>
          <span className="text-xs opacity-75">Aguardando dados</span>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <Calendar className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Crescimento</h3>
          <p className="text-2xl font-bold">0%</p>
          <span className="text-xs opacity-75">Aguardando dados</span>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'financial' && renderFinancialReport()}
      {selectedReport === 'clients' && renderClientReport()}
      
      {(selectedReport === 'services' || selectedReport === 'contracts') && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Relatório em Desenvolvimento</h3>
          <p className="text-gray-600">Este relatório estará disponível em breve.</p>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('Erro no componente Reports:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <FileText className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Erro ao carregar página</h3>
            <p className="text-sm">Tente recarregar a página</p>
            <p className="text-xs mt-2 text-gray-500">Erro: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }
};

export default Reports;