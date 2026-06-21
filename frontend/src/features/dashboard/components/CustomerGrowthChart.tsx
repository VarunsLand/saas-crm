'use client';
import { useFinancialCharts } from '../hooks/useFinancialAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { DashboardEmptyState } from '@/components/ui/DashboardEmptyState';
import { Users } from 'lucide-react';

export function CustomerGrowthChart() {
  const { data, isLoading } = useFinancialCharts();

  if (isLoading) {
    return <div className="h-[250px] w-full bg-white/5 border border-white/10 rounded-xl animate-pulse" />;
  }

  const chartData = data?.customerGrowthTrend || [];
  const hasData = chartData.some((d: { customers: number }) => d.customers > 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="flex flex-col h-full bg-[#0B1220] rounded-xl border border-white/10 p-5 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

      <div className="mb-4 z-10">
        <h3 className="text-sm font-medium text-slate-200 tracking-wide">Customer Growth</h3>
        <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Active Accounts (6 Mo)</p>
      </div>
      
      <div className="flex-1 w-full min-h-[200px] z-10">
        {!hasData ? (
           <DashboardEmptyState 
             icon={<Users className="w-5 h-5 opacity-50" />}
             title="No Customer Growth Yet"
             description="Once you close deals, your customer growth over time will appear here."
           />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
