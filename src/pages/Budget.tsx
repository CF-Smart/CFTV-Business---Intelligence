import React, { useState } from 'react';
import { BarChart, Table, DollarSign, TrendingUp, Calculator, LineChart } from 'lucide-react';
import { useDataStore } from '../hooks/useDataStore';
import { useAuth } from '../hooks/useAuth';

interface BudgetProps {
  selectedPeriod: string;
  selectedClient: string;
}

const Budget: React.FC<BudgetProps> = (props) => {
  const { user } = useAuth();
  
  // TODOS OS HOOKS DEVEM VIR ANTES DE QUALQUER RETURN CONDICIONAL
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [budgetData, setBudgetData] = useState({
    saldoInicial: 0,
    receitaPrevista: 0,
    receitaRealizada: 0,
    despesasDiretasPrevistas: 0,
    despesasDiretas: 0,
    despesasOperacionaisPrevistas: 0,
    despesasOperacionais: 0,
    despesasNaoOperacionaisPrevistas: 0,
    despesasNaoOperacionais: 0,
    saldoCaixa: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { getBudgetData } = useDataStore();
  
  // Load budget data from Supabase
  React.useEffect(() => {
    const loadBudgetData = async () => {
      setIsLoading(true);
      try {
        const data = await getBudgetData(props.selectedPeriod);
        setBudgetData(data);
      } catch (error) {
        console.error('Erro ao carregar dados orçamentários:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBudgetData();
  }, [props.selectedPeriod]);
  
  // Debug temporário
  console.log('=== BUDGET DEBUG ===');
  console.log('User:', user);
  console.log('User email:', user?.email);
  console.log('Expected email:', 'cfsmart@cfcontabilidade.com');
  console.log('Emails match:', user?.email === 'cfsmart@cfcontabilidade.com');
  console.log('========================');
  
  // Só permite acesso para o admin CF Smart
  if (!user || user.email !== 'cfsmart@cfcontabilidade.com') {
    console.log('BLOCKING ACCESS - User not admin');
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Em desenvolvimento</h2>
          <p>Em desenvolvimento, agradecemos a compreensão :)</p>
          <p className="text-xs mt-2">Debug: {user?.email || 'No user'}</p>
        </div>
      </div>
    );
  }
  
  console.log('ALLOWING ACCESS - User is admin');

  // Display current period data
  const currentPeriodLabel = props.selectedPeriod === 'all' ? 'Todos os Períodos' : 
    (() => {
      const [year, month] = props.selectedPeriod.split('-');
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    })();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const TableView = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h3 className="text-xl font-bold">Dados Orçamentários</h3>
        <p className="text-blue-100">Período: {currentPeriodLabel}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Item</th>
              <th className="px-6 py-4 text-right font-semibold">Saldo Inicial</th>
              <th className="px-4 py-4 text-center font-semibold">Receita</th>
              <th className="px-4 py-4 text-center font-semibold">Desp. Diretas</th>
              <th className="px-4 py-4 text-center font-semibold">Desp. Operacionais</th>
              <th className="px-4 py-4 text-center font-semibold">Desp. Não Op.</th>
              <th className="px-6 py-4 text-right font-semibold">Saldo de Caixa</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{currentPeriodLabel}</td>
              <td className="px-6 py-4 text-right text-blue-600 font-medium">{formatCurrency(budgetData.saldoInicial)}</td>
              <td className="px-4 py-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Prev.</div>
                  <div className="text-sm font-medium text-green-600">{formatCurrency(budgetData.receitaPrevista)}</div>
                  <div className="text-xs text-gray-500 mt-1">Real.</div>
                  <div className="text-sm font-bold text-green-700">{formatCurrency(budgetData.receitaRealizada)}</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Prev.</div>
                  <div className="text-sm font-medium text-red-600">{formatCurrency(budgetData.despesasDiretasPrevistas)}</div>
                  <div className="text-xs text-gray-500 mt-1">Real.</div>
                  <div className="text-sm font-bold text-red-700">{formatCurrency(budgetData.despesasDiretas)}</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Prev.</div>
                  <div className="text-sm font-medium text-orange-600">{formatCurrency(budgetData.despesasOperacionaisPrevistas)}</div>
                  <div className="text-xs text-gray-500 mt-1">Real.</div>
                  <div className="text-sm font-bold text-orange-700">{formatCurrency(budgetData.despesasOperacionais)}</div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Prev.</div>
                  <div className="text-sm font-medium text-purple-600">{formatCurrency(budgetData.despesasNaoOperacionaisPrevistas)}</div>
                  <div className="text-xs text-gray-500 mt-1">Real.</div>
                  <div className="text-sm font-bold text-purple-700">{formatCurrency(budgetData.despesasNaoOperacionais)}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-right text-green-700 font-bold">{formatCurrency(budgetData.saldoCaixa)}</td>
            </tr>
            {budgetData.receitaRealizada === 0 && budgetData.saldoCaixa === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">Nenhum dado orçamentário disponível</p>
                    <p className="text-sm">Importe arquivos financeiros para visualizar o orçamento</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ChartView = () => (
    <div className="space-y-6">
      {/* Gráfico de Linha Simulado */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <LineChart className="w-5 h-5 mr-2 text-blue-600" />
          Evolução Mensal - Valores Realizados
        </h3>
        
        <div className="space-y-8">
          {/* Legenda */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span>Saldo Inicial</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>Receita Realizada</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Despesas Diretas</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              <span>Despesas Operacionais</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
              <span>Despesas Não Operacionais</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-indigo-500 rounded mr-2"></div>
              <span>Saldo Final</span>
            </div>
          </div>
          
          {/* Gráfico Simulado */}
          <div className="relative h-80 bg-gray-50 rounded-lg p-4">
            <div className="absolute inset-4">
              {/* Eixo Y */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
              {/* Eixo X */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
              
              {/* Pontos e linhas simuladas */}
              <div className="relative h-full">
                {budgetData.map((data, index) => (
                  <div key={index} className="absolute" style={{ left: `${(index * 40) + 10}%`, bottom: '10px' }}>
                    <div className="text-xs text-gray-600 mb-2 transform -rotate-45 origin-bottom-left">
                      {data.month.split(' ')[0]}
                    </div>
                  </div>
                ))}
                
                {/* Linha de exemplo para Saldo Final */}
                <svg className="absolute inset-0 w-full h-full">
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="3"
                    points="10,80 50,60 90,40"
                  />
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    points="10,70 50,65 90,60"
                  />
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    points="10,85 50,82 90,88"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabela de Dados */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Detalhados por Mês</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Mês</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Saldo Inicial</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Receita Real.</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Desp. Diretas</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Desp. Operac.</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Desp. Não Op.</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-900">Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{currentPeriodLabel}</td>
                <td className="px-4 py-3 text-right text-blue-600 font-medium">{formatCurrency(budgetData.saldoInicial)}</td>
                <td className="px-4 py-3 text-right text-green-600 font-medium">{formatCurrency(budgetData.receitaRealizada)}</td>
                <td className="px-4 py-3 text-right text-red-600 font-medium">{formatCurrency(budgetData.despesasDiretas)}</td>
                <td className="px-4 py-3 text-right text-orange-600 font-medium">{formatCurrency(budgetData.despesasOperacionais)}</td>
                <td className="px-4 py-3 text-right text-purple-600 font-medium">{formatCurrency(budgetData.despesasNaoOperacionais)}</td>
                <td className="px-4 py-3 text-right text-indigo-600 font-bold">{formatCurrency(budgetData.saldoCaixa)}</td>
              </tr>
              {budgetData.receitaRealizada === 0 && budgetData.saldoCaixa === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">Nenhum dado orçamentário disponível</p>
                      <p className="text-sm">Importe extratos financeiros para visualizar o orçamento</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados orçamentários...</p>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        {/* Header with View Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calculator className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orçamento Empresarial</h1>
              <p className="text-gray-600">Acompanhe receitas, despesas e saldo de caixa</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'table' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Tabela</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 ${
                viewMode === 'chart' 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <BarChart className="w-4 h-4" />
              <span>Gráfico</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Saldo Atual</h3>
          <p className="text-2xl font-bold">{formatCurrency(budgetData.saldoCaixa)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Receita Acumulada</h3>
          <p className="text-2xl font-bold">{formatCurrency(budgetData.receitaRealizada)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl text-white">
          <BarChart className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Despesas Acumuladas</h3>
          <p className="text-2xl font-bold">{formatCurrency(budgetData.despesasDiretas + budgetData.despesasOperacionais + budgetData.despesasNaoOperacionais)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <Calculator className="w-8 h-8 mb-2 opacity-80" />
          <h3 className="text-sm font-medium opacity-90">Margem Líquida</h3>
          <p className="text-2xl font-bold">
            {budgetData.receitaRealizada > 0 
              ? `${(((budgetData.receitaRealizada - (budgetData.despesasDiretas + budgetData.despesasOperacionais + budgetData.despesasNaoOperacionais)) / budgetData.receitaRealizada) * 100).toFixed(1)}%`
              : '0%'
            }
          </p>
        </div>
      </div>

      {/* Data View */}
      {viewMode === 'table' ? <TableView /> : <ChartView />}
    </div>
  );
  } catch (error) {
    console.error('Erro no componente Budget:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Calculator className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Erro ao carregar página</h3>
            <p className="text-sm">Tente recarregar a página</p>
            <p className="text-xs mt-2 text-gray-500">Erro: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }
};

export default Budget;