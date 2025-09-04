import React, { useState } from 'react';
import MetricCard from '../components/Dashboard/MetricCard';
import ClientRanking from '../components/Dashboard/ClientRanking';
import MonthlyRevenueChart from '../components/Dashboard/MonthlyRevenueChart';
import { useDataStore } from '../hooks/useDataStore';
import { 
  Wrench, 
  FileText, 
  ShoppingCart, 
  DollarSign 
} from 'lucide-react';

interface DashboardProps {
  selectedClient: string;
  startDate: string;
  endDate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedClient, startDate, endDate }) => {
  const { getMetricsWithDateRange, getClientRankingWithDateRange, getMonthlyRevenueWithDateRange } = useDataStore();
  const [metrics, setMetrics] = useState({ services: { value: 0, change: 0 }, contracts: { value: 0, change: 0 }, sales: { value: 0, change: 0 }, total: { value: 0, change: 0 } });
  const [clientRanking, setClientRanking] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do Supabase
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [metricsData, rankingData, revenueData] = await Promise.all([
          getMetricsWithDateRange(selectedClient, startDate, endDate),
          getClientRankingWithDateRange(selectedClient, startDate, endDate),
          getMonthlyRevenueWithDateRange(selectedClient, startDate, endDate)
        ]);
        setMetrics(metricsData);
        setClientRanking(rankingData);
        setMonthlyRevenue(revenueData);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedClient, startDate, endDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Faturamento Serviços"
          value={formatCurrency(metrics.services.value)}
          change={metrics.services.change}
          icon={<Wrench className="w-6 h-6 text-white" />}
          color="from-blue-500 to-blue-600"
        />
        <MetricCard
          title="Faturamento Contratos"
          value={formatCurrency(metrics.contracts.value)}
          change={metrics.contracts.change}
          icon={<FileText className="w-6 h-6 text-white" />}
          color="from-green-500 to-green-600"
        />
        <MetricCard
          title="Faturamento Vendas"
          value={formatCurrency(metrics.sales.value)}
          change={metrics.sales.change}
          icon={<ShoppingCart className="w-6 h-6 text-white" />}
          color="from-orange-500 to-orange-600"
        />
        <MetricCard
          title="Faturamento Total"
          value={formatCurrency(metrics.total.value)}
          change={metrics.total.change}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyRevenueChart data={monthlyRevenue} />
        <ClientRanking clients={clientRanking} />
      </div>
    </div>
  );
};

export default Dashboard;