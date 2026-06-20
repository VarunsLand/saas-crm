'use client';
import { useExpenses } from '../hooks/useFinancialAnalytics';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

export function ExpenseDistributionChart() {
  const { data: expenses, isLoading } = useExpenses();

  if (isLoading) {
    return <div className="h-[250px] w-full bg-white/5 border border-white/10 rounded-xl animate-pulse" />;
  }

  // Aggregate by category
  const categoryMap = (expenses || []).reduce((acc: any, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  })).sort((a, b) => b.value - a.value);

  const hasData = chartData.length > 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-col h-full bg-[#0B1220] rounded-xl border border-white/10 p-5 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="mb-4 z-10">
        <h3 className="text-sm font-medium text-slate-200 tracking-wide">Expense Distribution</h3>
        <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">By Category</p>
      </div>
      
      <div className="flex-1 w-full min-h-[200px] z-10">
        {!hasData ? (
           <div className="h-full flex items-center justify-center text-slate-500 text-sm">
             <span className="font-mono text-xs border border-dashed border-slate-700 px-4 py-2 rounded-lg">NO DATA</span>
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => `₹${value.toLocaleString()}`}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
