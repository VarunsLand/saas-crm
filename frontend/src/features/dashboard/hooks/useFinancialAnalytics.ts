import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { useDashboard } from './useDashboard';

export const useFinancialKPIs = () => {
  const query = useDashboard();
  return { ...query, data: query.data?.kpis };
};

export const useFinancialInsights = () => {
  const query = useDashboard();
  return { 
    ...query, 
    data: {
      leadSources: query.data?.leadSources,
      topCustomers: query.data?.topCustomers,
      recentRevenue: query.data?.recentActivity,
      businessInsights: query.data?.insights
    } 
  };
};

export function useFinancialCharts() {
  const query = useDashboard();
  return { 
    ...query, 
    data: {
      revenueExpenseTrend: query.data?.trends,
      customerGrowthTrend: query.data?.customerGrowth
    } 
  };
}

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await api.get('/expenses');
      return data.data.entries;
    }
  });
};
