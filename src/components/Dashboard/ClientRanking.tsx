import React from 'react';
import { Crown, Medal, Award, TrendingUp } from 'lucide-react';

interface Client {
  name: string;
  revenue: number;
  percentage: number;
}

interface ClientRankingProps {
  clients: Client[];
}

const ClientRanking: React.FC<ClientRankingProps> = ({ clients }) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{index + 1}</span>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Crown className="w-6 h-6 text-yellow-500 mr-2" />
        Ranking de Faturamento por Cliente
      </h3>
      
      <div className="space-y-4">
        {clients.length > 0 ? clients.map((client, index) => (
          <div key={client.name} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0">
              {getRankIcon(index)}
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{client.name}</h4>
              <p className="text-sm text-gray-600">{formatCurrency(client.revenue)}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${client.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 w-12">
                {client.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        )) : (
          <div className="text-center py-8">
            <div className="text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Nenhum cliente cadastrado</p>
              <p className="text-sm">Importe arquivos de faturamento para ver o ranking</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientRanking;