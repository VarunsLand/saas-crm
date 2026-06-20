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
    { label: 'Best Month', value: biz?.bestMonth || 'N/A', icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Top Customer', value: biz?.topCustomer || 'N/A', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Top Lead Source', value: biz?.bestSource || 'N/A', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Growth Peak', value: 'N/A', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-400/10' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-[#0B1220] rounded-xl border border-white/10 shadow-2xl flex flex-col h-full overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="p-5 border-b border-white/5 z-10">
        <h3 className="text-sm font-medium text-slate-200 tracking-wide">Business Insights</h3>
        <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">AI-Driven Database Analytics</p>
      </div>
      
      <div className="flex-1 p-5 grid grid-cols-2 gap-4 z-10">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${insight.bg}`}>
                  <Icon className={`w-4 h-4 ${insight.color}`} />
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 mb-1">{insight.label}</div>
                <div className="text-base font-semibold text-slate-200 truncate">{insight.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
