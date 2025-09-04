import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface MonthlyData {
  period: string;
  month: string;
  total: number;
}

interface MonthlyRevenueChartProps {
  data: MonthlyData[];
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const maxValue = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
        Faturamento Total por Mês
      </h3>
      
      {data.length > 0 ? (
        <div className="space-y-4">
          {/* Chart Bars */}
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={item.period} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium text-gray-700 text-right">
                  {item.month}
                </div>
                <div className="flex-1 relative">
                  <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                      style={{ 
                        width: `${(item.total / maxValue) * 100}%`,
                        minWidth: item.total > 0 ? '60px' : '0px'
                      }}
                    >
                      <span className="text-white text-xs font-bold">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Geral:</span>
              <span className="font-bold text-lg text-blue-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.total, 0))}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Média Mensal:</span>
              <span className="font-medium text-gray-800">
                {formatCurrency(data.reduce((sum, item) => sum + item.total, 0) / Math.max(data.length, 1))}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Nenhum dado de faturamento disponível</p>
            <p className="text-sm">Importe arquivos para visualizar o gráfico mensal</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyRevenueChart;