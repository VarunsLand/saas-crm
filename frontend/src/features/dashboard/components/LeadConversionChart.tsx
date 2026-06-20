'use client';
import { useFinancialKPIs } from '../hooks/useFinancialAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function LeadConversionChart() {
  const { data, isLoading } = useFinancialKPIs();

  if (isLoading) {
    return <div className="h-[250px] w-full flex items-center justify-center text-slate-400 text-sm font-mono">Loading chart data...</div>;
  }

  const funnel = data?.funnel;
  
  const chartData = funnel ? [
    { stage: 'Total Leads', count: funnel.totalLeads },
    { stage: 'Qualified', count: funnel.qualifiedLeads },
    { stage: 'Converted', count: funnel.wonLeads },
  ] : [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Conversion Funnel</h3>
        <p className="text-xs text-slate-500 mt-1">Lead progression stages</p>
      </div>
      <div className="flex-1 min-h-[200px] w-full">
        {chartData.length === 0 || chartData[0].count === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
              <XAxis type="number" hide />
              <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
