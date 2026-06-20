'use client';
import { useFinancialCharts } from '../hooks/useFinancialAnalytics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export function RevenueVsExpenseChart() {
  const { data, isLoading } = useFinancialCharts();

  if (isLoading) {
    return <div className="h-[320px] w-full bg-white/5 border border-white/10 rounded-xl animate-pulse" />;
  }

  const chartData = data?.revenueExpenseTrend || [];
  const hasData = chartData.some((d: any) => d.revenue > 0 || d.expense > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col h-[320px] bg-[#0B1220] rounded-xl border border-white/10 p-5 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      
      <div className="mb-6 flex justify-between items-center z-10">
        <div>
          <h3 className="text-sm font-medium text-slate-200 tracking-wide">Revenue vs Expenses</h3>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Trailing 12 Months</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" /><span className="text-xs text-slate-400">Revenue</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /><span className="text-xs text-slate-400">Expenses</span></div>
        </div>
      </div>
      
      <div className="flex-1 w-full z-10">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
            <div className="w-16 h-16 mb-4 rounded-full border border-dashed border-slate-700 flex items-center justify-center">
              <span className="text-slate-600 font-mono text-xs">NO DATA</span>
            </div>
            Log revenue or expenses to generate chart
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#e2e8f0' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
