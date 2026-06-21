import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export interface DashboardKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeCustomers: number;
  customerGrowth: number;
  conversionRate: number;
  funnel: {
    totalLeads: number;
    qualifiedLeads: number;
    wonLeads: number;
  };
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  expense: number;
}

export interface CustomerGrowthTrend {
  month: string;
  customers: number;
}

export interface BusinessInsights {
  revenueGrowth: string;
  expenseGrowth: string;
  topCustomer: string;
  topLeadSource: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  trends: MonthlyTrend[];
  customerGrowth: CustomerGrowthTrend[];
  insights: BusinessInsights;
  recentActivity: any[];
  topCustomers: any[];
  leadSources: any[];
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard_data'],
    queryFn: async () => {
      const response = await api.get('/financial/dashboard');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Don't retry endlessly on 500s
  });
}
