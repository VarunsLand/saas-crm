'use client';
import { useFinancialInsights } from '../hooks/useFinancialAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { IndianRupee } from 'lucide-react';

export function RecentRevenueActivity() {
  const { data, isLoading } = useFinancialInsights();

  if (isLoading) {
    return <div className="h-full w-full bg-white/5 border border-white/10 rounded-xl animate-pulse min-h-[250px]" />;
  }

  const recentEntries = data?.recentRevenue || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-[#0B1220] rounded-xl border border-white/10 shadow-2xl flex flex-col h-full overflow-hidden relative"
    >
      <div className="p-5 border-b border-white/5 z-10 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-slate-200 tracking-wide">Recent Activity</h3>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Latest Logged Revenue</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-2 z-10">
        {recentEntries.length === 0 ? (
          <div className="h-full min-h-[150px] flex items-center justify-center text-slate-500 text-sm">
             <span className="font-mono text-xs border border-dashed border-slate-700 px-4 py-2 rounded-lg">NO DATA</span>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {recentEntries.map((entry: { id: string, amount: number, customer: string, date: string }, i: number) => (
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + (i * 0.1) }}
                key={entry.id} 
                className="flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">{entry.customer}</span>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5">{formatDistanceToNow(new Date(entry.date), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="text-sm font-mono font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                  +₹{entry.amount.toLocaleString()}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
