'use client';
import { useFinancialInsights } from '../hooks/useFinancialAnalytics';
import { TrendingUp, Target, Crown, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function BusinessInsightsWidget() {
  const { data: insightData, isLoading } = useFinancialInsights();

  if (isLoading) {
    return <div className="h-full w-full bg-white/5 border border-white/10 rounded-xl animate-pulse min-h-[250px]" />;
  }

  const biz = insightData?.businessInsights;
  
  const insights = [
    { label: 'Revenue Trend', value: biz?.revenueGrowth || 'N/A', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Expense Trend', value: biz?.expenseGrowth || 'N/A', icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Top Customer', value: biz?.topCustomer || 'N/A', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Top Lead Source', value: biz?.topLeadSource || 'N/A', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-[#0B1220] rounded-xl border border-white/10 shadow-2xl flex flex-col w-full overflow-hidden relative shrink-0 h-auto"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="p-5 border-b border-white/5 z-10">
        <h3 className="text-sm font-medium text-slate-200 tracking-wide">Business Insights</h3>
        <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">AI-Driven Database Analytics</p>
      </div>
      
      <div className="flex-1 p-5 flex flex-col gap-3 z-10">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-start gap-4 hover:bg-white/10 transition-colors">
              <div className={`p-2 rounded-lg shrink-0 mt-1 ${insight.bg}`}>
                <Icon className={`w-4 h-4 ${insight.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">{insight.label}</div>
                <div className="text-sm text-slate-300 leading-relaxed">{insight.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
