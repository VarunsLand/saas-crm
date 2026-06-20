'use client';

import dynamic from 'next/dynamic';
import { KPIHeader } from '@/features/dashboard/components/KPIHeader';
import { BusinessInsightsWidget } from '@/features/dashboard/components/BusinessInsightsWidget';
import { RecentRevenueActivity } from '@/features/dashboard/components/RecentRevenueActivity';
import { UpcomingActionCenter } from '@/features/dashboard/components/UpcomingActionCenter';

const RevenueVsExpenseChart = dynamic(() => import('@/features/dashboard/components/RevenueVsExpenseChart').then(mod => mod.RevenueVsExpenseChart), { ssr: false, loading: () => <div className="h-[300px] bg-white/5 animate-pulse border border-white/10 rounded-2xl" /> });
const ProfitTrendChart = dynamic(() => import('@/features/dashboard/components/ProfitTrendChart').then(mod => mod.ProfitTrendChart), { ssr: false, loading: () => <div className="h-[300px] bg-white/5 animate-pulse border border-white/10 rounded-2xl" /> });
const CustomerGrowthChart = dynamic(() => import('@/features/dashboard/components/CustomerGrowthChart').then(mod => mod.CustomerGrowthChart), { ssr: false, loading: () => <div className="h-[300px] bg-white/5 animate-pulse border border-white/10 rounded-2xl" /> });
const LeadSourceAnalytics = dynamic(() => import('@/features/dashboard/components/LeadSourceAnalytics').then(mod => mod.LeadSourceAnalytics), { ssr: false, loading: () => <div className="h-[300px] bg-white/5 animate-pulse border border-white/10 rounded-2xl" /> });
const ExpenseDistributionChart = dynamic(() => import('@/features/dashboard/components/ExpenseDistributionChart').then(mod => mod.ExpenseDistributionChart), { ssr: false, loading: () => <div className="h-[300px] bg-white/5 animate-pulse border border-white/10 rounded-2xl" /> });

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full bg-[#050816] text-slate-200 selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
        
        {/* Row 1: KPIs */}
        <KPIHeader />

        {/* Row 2: Main Financials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueVsExpenseChart />
          <ProfitTrendChart />
        </div>

        {/* Row 3: Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ExpenseDistributionChart />
          <CustomerGrowthChart />
          <LeadSourceAnalytics />
        </div>

        {/* Row 4: Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingActionCenter />
          <div className="space-y-6 flex flex-col">
            <BusinessInsightsWidget />
            <RecentRevenueActivity />
          </div>
        </div>

      </div>
    </div>
  );
}
