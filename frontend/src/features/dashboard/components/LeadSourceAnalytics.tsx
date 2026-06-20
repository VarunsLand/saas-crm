'use client';
import { useFinancialInsights } from '../hooks/useFinancialAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export function LeadSourceAnalytics() {
  const { data, isLoading } = useFinancialInsights();

  if (isLoading) {
    return <div className="h-[250px] w-full bg-white/5 border border-white/10 rounded-xl animate-pulse" />;
  }

  const chartData = data?.leadSources || [];
  const hasData = chartData.some((d: any) => d.count > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex flex-col h-full bg-[#0B1220] rounded-xl border border-white/10 p-5 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="mb-4 z-10">
        <h3 className="text-sm font-medium text-slate-200 tracking-wide">Lead Sources</h3>
        <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Acquisition Channels</p>
      </div>
      
      <div className="flex-1 w-full min-h-[200px] z-10">
        {!hasData ? (
           <div className="h-full flex items-center justify-center text-slate-500 text-sm">
             <span className="font-mono text-xs border border-dashed border-slate-700 px-4 py-2 rounded-lg">NO DATA</span>
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={80} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} 
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
