import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface BudgetData {
  saldoInicial: number;
  receitaPrevista: number;
  receitaRealizada: number;
  despesasDiretasPrevistas: number;
  despesasDiretas: number;
  despesasOperacionaisPrevistas: number;
  despesasOperacionais: number;
  despesasNaoOperacionaisPrevistas: number;
  despesasNaoOperacionais: number;
  saldoCaixa: number;
}

interface BudgetOverviewProps {
  data: BudgetData;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getVariationPercentage = (predicted: number, actual: number) => {
    return ((actual / predicted) * 100).toFixed(1);
  };

  const getVariationIcon = (predicted: number, actual: number) => {
    const percentage = (actual / predicted) * 100;
    if (percentage >= 100) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <DollarSign className="w-6 h-6 text-green-500 mr-2" />
        Visão Geral do Orçamento
      </h3>
      
      <div className="space-y-4">
        {/* Saldo Inicial */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900">Saldo Inicial de Caixa</h4>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(data.saldoInicial)}</p>
        </div>
        
        {/* Receita */}
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">Receita</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-green-600">Prevista</p>
                  <p className="text-lg font-bold text-green-700">{formatCurrency(data.receitaPrevista)}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600">Realizada</p>
                  <p className="text-lg font-bold text-green-800">{formatCurrency(data.receitaRealizada)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center ml-4">
              {getVariationIcon(data.receitaPrevista, data.receitaRealizada)}
              <span className="text-sm font-bold text-green-700 mt-1">
                {getVariationPercentage(data.receitaPrevista, data.receitaRealizada)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Despesas Diretas */}
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">Despesas Diretas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-red-600">Prevista</p>
                  <p className="text-lg font-bold text-red-700">{formatCurrency(data.despesasDiretasPrevistas)}</p>
                </div>
                <div>
                  <p className="text-xs text-red-600">Realizada</p>
                  <p className="text-lg font-bold text-red-800">{formatCurrency(data.despesasDiretas)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center ml-4">
              {getVariationIcon(data.despesasDiretasPrevistas, data.despesasDiretas)}
              <span className="text-sm font-bold text-red-700 mt-1">
                {getVariationPercentage(data.despesasDiretasPrevistas, data.despesasDiretas)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Despesas Operacionais */}
        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-2">Despesas Operacionais</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-orange-600">Prevista</p>
                  <p className="text-lg font-bold text-orange-700">{formatCurrency(data.despesasOperacionaisPrevistas)}</p>
                </div>
                <div>
                  <p className="text-xs text-orange-600">Realizada</p>
                  <p className="text-lg font-bold text-orange-800">{formatCurrency(data.despesasOperacionais)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center ml-4">
              {getVariationIcon(data.despesasOperacionaisPrevistas, data.despesasOperacionais)}
              <span className="text-sm font-bold text-orange-700 mt-1">
                {getVariationPercentage(data.despesasOperacionaisPrevistas, data.despesasOperacionais)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Despesas Não Operacionais */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-2">Despesas Não Operacionais</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-purple-600">Prevista</p>
                  <p className="text-lg font-bold text-purple-700">{formatCurrency(data.despesasNaoOperacionaisPrevistas)}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-600">Realizada</p>
                  <p className="text-lg font-bold text-purple-800">{formatCurrency(data.despesasNaoOperacionais)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center ml-4">
              {getVariationIcon(data.despesasNaoOperacionaisPrevistas, data.despesasNaoOperacionais)}
              <span className="text-sm font-bold text-purple-700 mt-1">
                {getVariationPercentage(data.despesasNaoOperacionaisPrevistas, data.despesasNaoOperacionais)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Saldo Final */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-indigo-900">Saldo Final de Caixa</h4>
              <p className="text-2xl font-bold text-indigo-700">{formatCurrency(data.saldoCaixa)}</p>
            </div>
            <Target className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;