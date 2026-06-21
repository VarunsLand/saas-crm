import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { Interaction } from '@/features/interactions/types';

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

export interface RecentActivity {
  id: string;
  amount: number;
  customer: string;
  date: string;
}

export interface TopCustomer {
  id: string;
  name: string;
  company: string;
  total_revenue: number;
}

export interface LeadSource {
  name: string;
  count: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  trends: MonthlyTrend[];
  customerGrowth: CustomerGrowthTrend[];
  insights: BusinessInsights;
  recentActivity: RecentActivity[];
  topCustomers: TopCustomer[];
  leadSources: LeadSource[];
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

export function useDashboardActivity(limit: number = 10) {
  return useQuery<{ data: { activity: Interaction[] } }>({
    queryKey: ['dashboard_activity', limit],
    queryFn: async () => {
      const response = await api.get(`/dashboard/activity?limit=${limit}`);
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}

export interface DashboardMetricsPayload {
  total_leads: number;
  leads_won: number;
  leads_lost: number;
  tasks_due_today: number;
}

export function useDashboardMetrics() {
  return useQuery<{ data: { metrics: DashboardMetricsPayload } }>({
    queryKey: ['dashboard_metrics'],
    queryFn: async () => {
      const response = await api.get('/dashboard/metrics');
      return response.data;
    },
    staleTime: 60 * 1000,
  });
}
