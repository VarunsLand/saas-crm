import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export const useFinancialKPIs = () => {
  return useQuery({
    queryKey: ['financial', 'kpis'],
    queryFn: async () => {
      const response = await api.get('/financial/kpi');
      return response.data.data;
    },
  });
};

export const useFinancialInsights = () => {
  return useQuery({
    queryKey: ['financial', 'insights'],
    queryFn: async () => {
      const response = await api.get('/financial/insights');
      return response.data.data;
    },
  });
};

export function useFinancialCharts() {
  return useQuery({
    queryKey: ['financial', 'charts'],
    queryFn: async () => {
      const { data } = await api.get('/financial/charts');
      return data.data;
    }
  });
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
