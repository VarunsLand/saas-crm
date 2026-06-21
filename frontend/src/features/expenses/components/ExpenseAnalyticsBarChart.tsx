'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatIndianCurrency } from '@/lib/utils';
import { ExpenseEntry } from '@/services/expense.service';

interface ExpenseAnalyticsProps {
  entries: ExpenseEntry[];
}

export function ExpenseAnalyticsBarChart({ entries }: ExpenseAnalyticsProps) {
  if (!entries || entries.length === 0) return null;

  // Aggregate by category
  const categoryMap = entries.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  // Sort and slice
  const sortedCategories = Object.keys(categoryMap).map(key => ({
    name: key,
    amount: categoryMap[key]
  })).sort((a, b) => b.amount - a.amount);

  const top10 = sortedCategories.slice(0, 10);
  const others = sortedCategories.slice(10);

  if (others.length > 0) {
    const othersAmount = others.reduce((sum, item) => sum + item.amount, 0);
    top10.push({ name: 'Others', amount: othersAmount });
  }

  // Reverse so the highest amount is at the top of the vertical bar chart
  const chartData = top10.reverse();

  return (
    <div className="bg-[#0B1220] border border-white/10 shadow-2xl rounded-xl p-5 w-full mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-slate-200">Expense Analytics</h3>
        <p className="text-sm text-slate-500 mt-1">Top categories by outbound cost</p>
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              type="number" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              tickFormatter={(val) => formatIndianCurrency(val)} 
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#cbd5e1' }} 
              width={100}
            />
            <Tooltip 
              formatter={(value: unknown) => formatIndianCurrency(value as number)}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}     itemStyle={{ color: '#ef4444' }}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Others' ? '#64748b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
