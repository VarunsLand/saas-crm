'use client';
import { useFinancialKPIs } from '../hooks/useFinancialAnalytics';
import { Users, Target, IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { formatIndianCurrency } from '@/lib/utils';

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
  const { data, isLoading, isError } = useFinancialKPIs();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={`fin-load-${i}`} className="h-[104px] bg-white/5 border border-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={`op-load-${i}`} className="h-[104px] bg-white/5 border border-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-center h-[104px]">
        Unable to load data. Please try again later.
      </div>
    );
  }

  const funnel = data?.funnel;

  // Determine Margin Health Color
  const margin = data?.profitMargin || 0;
  let marginColor = "text-slate-100";
  if (margin >= 20) marginColor = "text-emerald-400";
  else if (margin >= 5 && margin < 20) marginColor = "text-amber-400";
  else if (margin < 5) marginColor = "text-red-400";

  // Determine Expense Ratio Health Color
  const expenseRatio = data?.expenseRatio || 0;
  let expenseColor = "text-slate-100";
  if (expenseRatio > 80) expenseColor = "text-red-400";
  else if (expenseRatio >= 60 && expenseRatio <= 80) expenseColor = "text-amber-400";
  else if (expenseRatio < 60 && expenseRatio > 0) expenseColor = "text-emerald-400";

  const financialKpis = [
    { label: 'Gross Sales', value: formatIndianCurrency(data?.grossSales || data?.totalRevenue), icon: IndianRupee, highlight: false },
    { label: 'Expenses', value: formatIndianCurrency(data?.totalExpenses), icon: TrendingDown, highlight: false },
    { label: 'Net Profit', value: formatIndianCurrency(data?.netProfit), icon: IndianRupee, highlight: true },
    { label: 'Profit Margin', value: `${margin}%`, icon: TrendingUp, highlight: true, valueColor: marginColor }
  ];

  const operationalKpis = [
    { label: 'Expense Ratio', value: `${expenseRatio}%`, icon: TrendingDown, valueColor: expenseColor },
    { label: 'Total Customers', value: data?.activeCustomers || 0, icon: Users, trend: data?.customerGrowth },
    { label: 'Conversion Rate', value: `${data?.conversionRate || 0}%`, icon: Target },
    { label: 'Total Leads', value: funnel?.totalLeads || 0, icon: Users }
  ];

  const renderKpiCard = (kpi: any, idx: number) => {
    const Icon = kpi.icon;
    const hasTrend = typeof kpi.trend === 'number' && !isNaN(kpi.trend);
    const isPositiveTrend = hasTrend && (kpi.trend as number) >= 0;

    return (
      <motion.div 
        key={kpi.label}
        variants={item}
        className={cn(
          "relative overflow-hidden flex flex-col p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
          kpi.highlight 
            ? "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40 hover:shadow-indigo-500/10" 
            : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
        )}
      >
        {kpi.highlight && (
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        )}
        <div className="flex items-center justify-between mb-3 z-10">
          <span className="text-[13px] font-medium text-slate-400">{kpi.label}</span>
          <Icon className={cn("w-4 h-4", kpi.highlight ? "text-indigo-400" : "text-slate-500")} />
        </div>
        
        <div className="flex items-baseline justify-between z-10">
          <h2 className={cn("text-2xl font-semibold tracking-tight font-mono", kpi.valueColor || "text-slate-100")}>
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
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full"
    >
      {/* Financial Core */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-200 tracking-wide uppercase">Financial Core</h3>
          <span className="text-xs text-slate-500">Cash Flow & Sustainability</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {financialKpis.map((kpi, idx) => renderKpiCard(kpi, idx))}
        </div>
      </div>

      {/* Operational Engine */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-200 tracking-wide uppercase">Operational Performance</h3>
          <span className="text-xs text-slate-500">Efficiency & Pipeline</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {operationalKpis.map((kpi, idx) => renderKpiCard(kpi, idx))}
        </div>
      </div>
    </motion.div>
  );
});
