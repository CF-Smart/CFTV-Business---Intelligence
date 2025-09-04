import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export interface ContractData {
  cliente: string;
  valor: number;
  data: string;
}

export interface ServiceData {
  cliente: string;
  valor: number;
  data: string;
}

export interface SaleData {
  cliente: string;
  valor: number;
  data: string;
}

export interface FinancialData {
  situacao: string;
  data: string;
  cliente: string;
  conta: string;
  categoria: string;
  valor: number;
  saldo: number;
}

export interface ImportedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  status: 'success' | 'error';
  records: number;
}

export interface DataStore {
  contracts: ContractData[];
  services: ServiceData[];
  sales: SaleData[];
  financial: FinancialData[];
  importedFiles: ImportedFile[];
}

const STORAGE_KEY = 'cftv_data_store';

export const useDataStore = () => {
  const [data, setData] = useState<DataStore>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    return {
      contracts: [],
      services: [],
      sales: [],
      financial: [],
      importedFiles: []
    };
  });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setData(parsedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  }, []);

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }, [data]);

  const addContracts = (contracts: ContractData[]) => {
    setData(prev => ({
      ...prev,
      contracts: [...prev.contracts, ...contracts]
    }));
  };

  const addServices = (services: ServiceData[]) => {
    setData(prev => ({
      ...prev,
      services: [...prev.services, ...services]
    }));
  };

  const addSales = (sales: SaleData[]) => {
    setData(prev => ({
      ...prev,
      sales: [...prev.sales, ...sales]
    }));
  };

  const addFinancial = (financial: FinancialData[]) => {
    setData(prev => ({
      ...prev,
      financial: [...prev.financial, ...financial]
    }));
  };

  const addImportedFile = (file: ImportedFile) => {
    setData(prev => ({
      ...prev,
      importedFiles: [...prev.importedFiles, file]
    }));
  };

  const removeImportedFile = (fileId: string) => {
    setData(prev => ({
      ...prev,
      importedFiles: prev.importedFiles.filter(file => file.id !== fileId)
    }));
  };

  const removeImportedFileAndData = (fileId: string, fileType: string) => {
    setData(prev => {
      const fileToRemove = prev.importedFiles.find(f => f.id === fileId);
      if (!fileToRemove) return prev;

      // Create new state without the file and its associated data
      let newState = {
        ...prev,
        importedFiles: prev.importedFiles.filter(file => file.id !== fileId)
      };

      // Remove associated data based on file type
      switch (fileType.toLowerCase()) {
        case 'contratos':
          // Remove all contracts data (since we can't track which came from this specific file)
          newState.contracts = [];
          break;
        case 'faturamento serviços':
          // Remove all services data
          newState.services = [];
          break;
        case 'vendas':
          // Remove all sales data
          newState.sales = [];
          break;
        case 'extratos financeiros':
          // Remove all financial data
          newState.financial = [];
          break;
      }

      return newState;
    });
  };

  const clearAllData = () => {
    setData({
      contracts: [],
      services: [],
      sales: [],
      financial: [],
      importedFiles: []
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    
    try {
      let cleanDateStr = dateStr.toString().trim();
      
      // Handle Excel date serial numbers first
      const numericDate = parseFloat(cleanDateStr);
      if (!isNaN(numericDate) && numericDate > 25000 && numericDate < 100000) {
        // Excel date serial number (days since 1900-01-01)
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + numericDate * 24 * 60 * 60 * 1000);
        if (!isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
          return date;
        }
      }
      
      // Remove any extra characters and normalize
      cleanDateStr = cleanDateStr.replace(/[^\d\/\-]/g, '');
      
      // Formato brasileiro DD/MM/YYYY ou DD/MM/YY
      if (cleanDateStr.includes('/')) {
        const parts = cleanDateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          let year = parseInt(parts[2]);
          
          // Convert 2-digit years to 4-digit
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }
          
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2020 && year <= 2030) {
            return new Date(year, month - 1, day);
          }
        }
      }
      
      // Formato DD-MM-YYYY
      if (cleanDateStr.includes('-')) {
        const parts = cleanDateStr.split('-');
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          let year = parseInt(parts[2]);
          
          if (year < 100) {
            year = year < 50 ? 2000 + year : 1900 + year;
          }
          
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2020 && year <= 2030) {
            return new Date(year, month - 1, day);
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const getAvailablePeriods = () => {
    const periods = new Set<string>();
    
    // Only get periods from revenue data (contracts, services, sales)
    const allDataItems = [
      ...data.contracts,
      ...data.services,
      ...data.sales
      // Note: financial data is NOT included - only for budget page
    ];
    
    allDataItems.forEach(item => {
      const date = parseDate(item.data);
      if (date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
        periods.add(periodKey);
      }
    });

    const sortedPeriods = Array.from(periods).sort().reverse();
    
    const periodOptions = [
      { value: 'all', label: 'Todos os Períodos' },
      ...sortedPeriods.map(period => {
        const [year, month] = period.split('-');
        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return {
          value: period,
          label: `${monthNames[parseInt(month) - 1]} ${year}`
        };
      })
    ];

    return periodOptions;
  };

  const getAvailableClients = async () => {
    try {
      // Buscar dados do Supabase
      const [contractsResult, servicesResult, salesResult] = await Promise.all([
        supabase.from('contracts').select('cliente'),
        supabase.from('services').select('cliente'),
        supabase.from('sales').select('cliente')
      ]);

      const contracts = contractsResult.data || [];
      const services = servicesResult.data || [];
      const sales = salesResult.data || [];

      const clients = new Set<string>();
      
      // Only get clients from revenue data (contracts, services, sales)
      const allItems = [
        ...contracts,
        ...services,
        ...sales
        // Note: financial data clients are not included - only for budget page
      ];
      
      allItems.forEach(item => {
        if (item.cliente && item.cliente.trim()) {
          clients.add(item.cliente.trim());
        }
      });

      const sortedClients = Array.from(clients).sort();
      
      const clientOptions = [
        { value: 'all', label: 'Todos os Clientes' },
        ...sortedClients.map(client => ({
          value: client,
          label: client
        }))
      ];

      return clientOptions;
    } catch (error) {
      console.error('Erro ao buscar clientes do Supabase:', error);
      return [{ value: 'all', label: 'Todos os Clientes' }];
    }
  };

  const getFilteredData = (selectedPeriod: string, selectedClient: string) => {
    const filterByPeriod = (items: any[]) => {
      if (selectedPeriod === 'all') return items;

      return items.filter(item => {
        const date = parseDate(item.data);
        if (!date) return false;
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
        return periodKey === selectedPeriod;
      });
    };

    const filterByClient = (items: any[]) => {
      if (selectedClient === 'all') return items;
      return items.filter(item => item.cliente && item.cliente.trim() === selectedClient);
    };

    const applyFilters = (items: any[]) => {
      return filterByClient(filterByPeriod(items));
    };

    return {
      contracts: applyFilters(data.contracts),
      services: applyFilters(data.services),
      sales: applyFilters(data.sales),
      financial: applyFilters(data.financial)
    };
  };

  // Get monthly revenue data for dashboard chart
  const getMonthlyRevenue = (selectedPeriod: string, selectedClient: string) => {
    // Apply both period and client filters
    const filterByPeriod = (items: any[]) => {
      if (selectedPeriod === 'all') return items;

      return items.filter(item => {
        const date = parseDate(item.data);
        if (!date) return false;
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
        return periodKey === selectedPeriod;
      });
    };

    const allRevenueData = [
      ...data.contracts,
      ...data.services,
      ...data.sales
    ];
    
    const filterByClient = (items: any[]) => {
      if (selectedClient === 'all') return items;
      return items.filter(item => item.cliente && item.cliente.trim() === selectedClient);
    };

    const filteredData = filterByClient(filterByPeriod(allRevenueData));
    
    const monthlyTotals: { [key: string]: number } = {};

    filteredData.forEach(item => {
      const date = parseDate(item.data);
      if (date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + item.valor;
      }
    });

    return Object.entries(monthlyTotals)
      .map(([period, total]) => {
        const [year, month] = period.split('-');
        const monthNames = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return {
          period,
          month: `${monthNames[parseInt(month) - 1]}/${year}`,
          total
        };
      })
      .sort((a, b) => a.period.localeCompare(b.period));
  };

  // Dashboard metrics - only from contracts, services, sales
  const getMetrics = (selectedPeriod: string, selectedClient: string) => {
    // Apply both period and client filters
    const filterByPeriod = (items: any[]) => {
      if (selectedPeriod === 'all') return items;

      return items.filter(item => {
        const date = parseDate(item.data);
        if (!date) return false;
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
        return periodKey === selectedPeriod;
      });
    };

    const filterByClient = (items: any[]) => {
      if (selectedClient === 'all') return items;
      return items.filter(item => item.cliente && item.cliente.trim() === selectedClient);
    };

    const applyFilters = (items: any[]) => {
      return filterByClient(filterByPeriod(items));
    };

    const filteredContracts = applyFilters(data.contracts);
    const filteredServices = applyFilters(data.services);
    const filteredSales = applyFilters(data.sales);
    
    const servicesTotal = filteredServices.reduce((sum, item) => sum + item.valor, 0);
    const contractsTotal = filteredContracts.reduce((sum, item) => sum + item.valor, 0);
    const salesTotal = filteredSales.reduce((sum, item) => sum + item.valor, 0);
    
    const totalRevenue = servicesTotal + contractsTotal + salesTotal;

    return {
      services: {
        value: servicesTotal,
        change: 0
      },
      contracts: {
        value: contractsTotal,
        change: 0
      },
      sales: {
        value: salesTotal,
        change: 0
      },
      total: {
        value: totalRevenue,
        change: 0
      }
    };
  };

  // Client ranking - only from contracts, services, sales
  const getClientRanking = (selectedPeriod: string, selectedClient: string) => {
    // Dashboard always uses all periods, only filter by client if not 'all'
    const allRevenueData = [
      ...data.contracts,
      ...data.services,
      ...data.sales
    ];
    
    const filteredData = selectedClient === 'all' 
      ? allRevenueData 
      : allRevenueData.filter(item => item.cliente && item.cliente.trim() === selectedClient);
    
    const clientTotals: { [key: string]: number } = {};

    filteredData.forEach(item => {
      const clientName = item.cliente.trim();
      clientTotals[clientName] = (clientTotals[clientName] || 0) + item.valor;
    });

    const total = Object.values(clientTotals).reduce((sum, value) => sum + value, 0);

    return Object.entries(clientTotals)
      .map(([name, revenue]) => ({
        name,
        revenue,
        percentage: total > 0 ? (revenue / total) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  // Budget data - only from financial statements
  const getBudgetData = async (selectedPeriod: string) => {
    try {
      // Buscar dados financeiros do Supabase
      const { data: financialData, error } = await supabase.from('financial').select('*');
      
      if (error) {
        console.error('Erro ao buscar dados financeiros:', error);
        return {
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
        };
      }

      const financial = financialData || [];
      
      const filteredFinancial = selectedPeriod === 'all' 
        ? financial 
        : financial.filter(item => {
            const date = parseDate(item.data);
            if (!date) return false;
            
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
            return periodKey === selectedPeriod;
          });

      // Calculate totals from financial data
      const receitas = filteredFinancial.filter(item => item.valor > 0);
      const despesas = filteredFinancial.filter(item => item.valor < 0);

      const receitaRealizada = receitas.reduce((sum, item) => sum + item.valor, 0);
      const despesasDiretas = Math.abs(despesas.filter(item => 
        item.categoria?.toLowerCase().includes('direta') || 
        item.conta?.toLowerCase().includes('direta')
      ).reduce((sum, item) => sum + item.valor, 0));
      
      const despesasOperacionais = Math.abs(despesas.filter(item => 
        item.categoria?.toLowerCase().includes('operacional') || 
        item.conta?.toLowerCase().includes('operacional')
      ).reduce((sum, item) => sum + item.valor, 0));
      
      const despesasNaoOperacionais = Math.abs(despesas.filter(item => 
        !item.categoria?.toLowerCase().includes('direta') && 
        !item.categoria?.toLowerCase().includes('operacional') &&
        !item.conta?.toLowerCase().includes('direta') && 
        !item.conta?.toLowerCase().includes('operacional')
      ).reduce((sum, item) => sum + item.valor, 0));

      const saldoCaixa = receitaRealizada - (despesasDiretas + despesasOperacionais + despesasNaoOperacionais);

      return {
        saldoInicial: 0, // Could be calculated from previous period
        receitaPrevista: receitaRealizada * 1.1, // 10% above actual as example
        receitaRealizada,
        despesasDiretasPrevistas: despesasDiretas * 0.9, // 10% below actual as example
        despesasDiretas,
        despesasOperacionaisPrevistas: despesasOperacionais * 0.9,
        despesasOperacionais,
        despesasNaoOperacionaisPrevistas: despesasNaoOperacionais * 0.9,
        despesasNaoOperacionais,
        saldoCaixa
      };
    } catch (error) {
      console.error('Erro ao buscar dados orçamentários:', error);
      return {
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
      };
    }
  };

  // Dashboard functions with date range filtering - now using Supabase
  const getMetricsWithDateRange = async (selectedClient: string, startDate: string, endDate: string) => {
    try {
      // Buscar dados do Supabase
      const [contractsResult, servicesResult, salesResult] = await Promise.all([
        supabase.from('contracts').select('*'),
        supabase.from('services').select('*'),
        supabase.from('sales').select('*')
      ]);

      const contracts = contractsResult.data || [];
      const services = servicesResult.data || [];
      const sales = salesResult.data || [];

      const filterByDateRange = (items: any[], startDate?: string, endDate?: string) => {
        if (!startDate && !endDate) return items;
        
        return items.filter(item => {
          const date = parseDate(item.data);
          if (!date) return false;
          
          const itemDate = date.toISOString().split('T')[0];
          
          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
          
          return true;
        });
      };

      const filterByClient = (items: any[]) => {
        if (selectedClient === 'all') {
          return items;
        }
        
        return items.filter(item => item.cliente && item.cliente.trim() === selectedClient);
      };

      const applyFilters = (items: any[], startDate?: string, endDate?: string) => {
        return filterByClient(filterByDateRange(items, startDate, endDate));
      };

      // Calcular período atual
      const currentStartDate = startDate;
      const currentEndDate = endDate;
      
      const currentFilteredContracts = applyFilters(contracts, currentStartDate, currentEndDate);
      const currentFilteredServices = applyFilters(services, currentStartDate, currentEndDate);
      const currentFilteredSales = applyFilters(sales, currentStartDate, currentEndDate);
      
      const currentServicesTotal = currentFilteredServices.reduce((sum, item) => sum + (item.valor || 0), 0);
      const currentContractsTotal = currentFilteredContracts.reduce((sum, item) => sum + (item.valor || 0), 0);
      const currentSalesTotal = currentFilteredSales.reduce((sum, item) => sum + (item.valor || 0), 0);
      const currentTotalRevenue = currentServicesTotal + currentContractsTotal + currentSalesTotal;

      // Calcular período anterior (mês anterior)
      let previousStartDate = '';
      let previousEndDate = '';
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Calcular o período anterior (mesmo número de dias)
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const previousEnd = new Date(start);
        previousEnd.setDate(previousEnd.getDate() - 1);
        const previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - daysDiff);
        
        previousStartDate = previousStart.toISOString().split('T')[0];
        previousEndDate = previousEnd.toISOString().split('T')[0];
      } else {
        // Se não há filtro de data, comparar com o mês anterior
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        previousStartDate = `${previousYear}-${(previousMonth + 1).toString().padStart(2, '0')}-01`;
        const lastDayOfPreviousMonth = new Date(previousYear, previousMonth + 1, 0);
        previousEndDate = `${previousYear}-${(previousMonth + 1).toString().padStart(2, '0')}-${lastDayOfPreviousMonth.getDate().toString().padStart(2, '0')}`;
      }

      const previousFilteredContracts = applyFilters(contracts, previousStartDate, previousEndDate);
      const previousFilteredServices = applyFilters(services, previousStartDate, previousEndDate);
      const previousFilteredSales = applyFilters(sales, previousStartDate, previousEndDate);
      
      const previousServicesTotal = previousFilteredServices.reduce((sum, item) => sum + (item.valor || 0), 0);
      const previousContractsTotal = previousFilteredContracts.reduce((sum, item) => sum + (item.valor || 0), 0);
      const previousSalesTotal = previousFilteredSales.reduce((sum, item) => sum + (item.valor || 0), 0);
      const previousTotalRevenue = previousServicesTotal + previousContractsTotal + previousSalesTotal;

      // Calcular variação percentual
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        services: {
          value: currentServicesTotal,
          change: calculateChange(currentServicesTotal, previousServicesTotal)
        },
        contracts: {
          value: currentContractsTotal,
          change: calculateChange(currentContractsTotal, previousContractsTotal)
        },
        sales: {
          value: currentSalesTotal,
          change: calculateChange(currentSalesTotal, previousSalesTotal)
        },
        total: {
          value: currentTotalRevenue,
          change: calculateChange(currentTotalRevenue, previousTotalRevenue)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar métricas do Supabase:', error);
      return {
        services: { value: 0, change: 0 },
        contracts: { value: 0, change: 0 },
        sales: { value: 0, change: 0 },
        total: { value: 0, change: 0 }
      };
    }
  };

  const getClientRankingWithDateRange = async (selectedClient: string, startDate: string, endDate: string) => {
    try {
      // Buscar dados do Supabase
      const [contractsResult, servicesResult, salesResult] = await Promise.all([
        supabase.from('contracts').select('*'),
        supabase.from('services').select('*'),
        supabase.from('sales').select('*')
      ]);

      const contracts = contractsResult.data || [];
      const services = servicesResult.data || [];
      const sales = salesResult.data || [];

      const filterByDateRange = (items: any[]) => {
        if (!startDate && !endDate) return items;
        
        return items.filter(item => {
          const date = parseDate(item.data);
          if (!date) return false;
          
          const itemDate = date.toISOString().split('T')[0];
          
          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
          
          return true;
        });
      };

      const filterByClient = (items: any[]) => {
        if (selectedClient === 'all') return items;
        return items.filter(item => item.cliente && item.cliente.trim() === selectedClient);
      };

      const allRevenueData = [
        ...contracts,
        ...services,
        ...sales
      ];
      
      const filteredData = filterByClient(filterByDateRange(allRevenueData));
      
      const clientTotals: { [key: string]: number } = {};

      filteredData.forEach(item => {
        const clientName = item.cliente.trim();
        clientTotals[clientName] = (clientTotals[clientName] || 0) + (item.valor || 0);
      });

      const total = Object.values(clientTotals).reduce((sum, value) => sum + value, 0);

      return Object.entries(clientTotals)
        .map(([name, revenue]) => ({
          name,
          revenue,
          percentage: total > 0 ? (revenue / total) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    } catch (error) {
      console.error('Erro ao buscar ranking de clientes do Supabase:', error);
      return [];
    }
  };

  const getMonthlyRevenueWithDateRange = async (selectedClient: string, startDate: string, endDate: string) => {
    try {
      // Buscar dados do Supabase
      const [contractsResult, servicesResult, salesResult] = await Promise.all([
        supabase.from('contracts').select('*'),
        supabase.from('services').select('*'),
        supabase.from('sales').select('*')
      ]);

      const contracts = contractsResult.data || [];
      const services = servicesResult.data || [];
      const sales = salesResult.data || [];

      const filterByDateRange = (items: any[]) => {
        if (!startDate && !endDate) return items;
        
        return items.filter(item => {
          const date = parseDate(item.data);
          if (!date) return false;
          
          const itemDate = date.toISOString().split('T')[0];
          
          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
          
          return true;
        });
      };

      const filterByClient = (items: any[]) => {
        if (selectedClient === 'all') return items;
        return items.filter(item => item.cliente && item.cliente.trim() === selectedClient);
      };

      const allRevenueData = [
        ...contracts,
        ...services,
        ...sales
      ];
      
      const filteredData = filterByClient(filterByDateRange(allRevenueData));
      
      const monthlyTotals: { [key: string]: number } = {};

      filteredData.forEach(item => {
        const date = parseDate(item.data);
        if (date) {
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
          monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (item.valor || 0);
        }
      });

      return Object.entries(monthlyTotals)
        .map(([period, total]) => {
          const [year, month] = period.split('-');
          const monthNames = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
          ];
          return {
            period,
            month: `${monthNames[parseInt(month) - 1]}/${year}`,
            total
          };
        })
        .sort((a, b) => a.period.localeCompare(b.period));
    } catch (error) {
      console.error('Erro ao buscar receita mensal do Supabase:', error);
      return [];
    }
  };

  return {
    data,
    addContracts,
    addServices,
    addSales,
    addFinancial,
    addImportedFile,
    removeImportedFile,
    removeImportedFileAndData,
    clearAllData,
    getMetrics,
    getClientRanking,
    getFilteredData,
    getAvailablePeriods,
    getAvailableClients,
    getBudgetData,
    getMonthlyRevenue,
    getMetricsWithDateRange,
    getClientRankingWithDateRange,
    getMonthlyRevenueWithDateRange
  };
};