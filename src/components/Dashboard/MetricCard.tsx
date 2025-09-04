import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const isPositive = change >= 0;
  
  return (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-white text-sm font-medium opacity-90">{title}</h3>
            <p className="text-white text-2xl font-bold">{value}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-300" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-300" />
        )}
        <span className={`ml-2 text-sm font-medium ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
          {isPositive ? '+' : ''}{change.toFixed(1)}%
        </span>
        <span className="ml-2 text-white text-xs opacity-75">vs mês anterior</span>
      </div>
    </div>
  );
};

export default MetricCard;