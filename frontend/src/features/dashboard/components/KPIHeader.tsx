'use client';
import { useFinancialKPIs } from '../hooks/useFinancialAnalytics';
import { Users, Target, IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

import { memo } from 'react';

export const KPIHeader = memo(function KPIHeader() {
  const { data, isLoading } = useFinancialKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[104px] bg-white/5 border border-white/10 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const formatCurrency = (val: number) => `₹${(val || 0).toLocaleString()}`;
  const funnel = data?.funnel;

  const kpis = [
    { label: 'Total Leads', value: funnel?.totalLeads || 0, icon: Target, trend: null },
    { label: 'Total Customers', value: data?.activeCustomers || 0, icon: Users, trend: data?.customerGrowth },
    { label: 'Conversion Rate', value: `${data?.conversionRate || 0}%`, icon: TrendingUp, trend: null },
    { label: 'Revenue', value: formatCurrency(data?.totalRevenue), icon: IndianRupee, trend: null },
    { label: 'Expenses', value: formatCurrency(data?.totalExpenses), icon: TrendingDown, trend: null },
    { label: 'Net Profit', value: formatCurrency(data?.netProfit), icon: IndianRupee, trend: null, highlight: true }
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full"
    >
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const hasTrend = typeof kpi.trend === 'number' && !isNaN(kpi.trend);
        const isPositiveTrend = hasTrend && (kpi.trend as number) >= 0;
        const isNegativeTrend = hasTrend && (kpi.trend as number) < 0;

        return (
          <motion.div 
            key={idx}
            variants={item}
            className={cn(
              "relative overflow-hidden flex flex-col p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
              kpi.highlight 
                ? "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-indigo-500/10" 
                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
            )}
          >
            {kpi.highlight && (
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl" />
            )}
            <div className="flex items-center justify-between mb-3 z-10">
              <span className="text-[13px] font-medium text-slate-400">{kpi.label}</span>
              <Icon className={cn("w-4 h-4", kpi.highlight ? "text-indigo-400" : "text-slate-500")} />
            </div>
            
            <div className="flex items-baseline justify-between z-10">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-100 font-mono">
                {kpi.value}
              </h2>
              {hasTrend && (
                <span className={cn(
                  "flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded-full",
                  isPositiveTrend ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                )}>
                  {isPositiveTrend ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {Math.abs(kpi.trend as number)}%
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
});
