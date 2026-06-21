'use client';
import { useExpenses } from '../hooks/useFinancialAnalytics';
import { formatIndianCurrency } from '@/lib/utils';

export function TopExpensesWidget() {
  const { data: expenses, isLoading } = useExpenses();

  if (isLoading) {
    return <div className="h-full min-h-[250px] w-full bg-white/5 border border-white/10 rounded-xl animate-pulse" />;
  }

  // Aggregate by category
  const categoryMap = (expenses || []).reduce((acc: Record<string, number>, curr: { category: string, amount: number }) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const totalExpense = Object.values(categoryMap).reduce((sum: number, val: unknown) => sum + (val as number), 0);

  const chartData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  })).sort((a, b) => b.value - a.value).slice(0, 5); // Take top 5

  const hasData = chartData.length > 0;

  return (
    <div className="flex flex-col h-full bg-[#0B1220] rounded-xl border border-white/10 p-5 shadow-2xl relative overflow-hidden">
      <div className="mb-4 z-10 flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h3 className="text-sm font-medium text-slate-200 tracking-wide">Top Expenses</h3>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">By Category</p>
        </div>
      </div>
      
      <div className="flex-1 w-full z-10 overflow-hidden">
        {!hasData ? (
           <div className="h-full flex items-center justify-center text-slate-500 text-sm">
             <span className="font-mono text-xs border border-dashed border-slate-700 px-4 py-2 rounded-lg">NO DATA</span>
           </div>
        ) : (
          <ul className="space-y-3 mt-2">
            {chartData.map((item, idx) => {
              const percentage = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
              return (
                <li key={idx} className="relative p-3 rounded-lg overflow-hidden border border-white/5 bg-white/[0.02]">
                  {/* Subtle background progress bar */}
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-red-500/10 pointer-events-none" 
                    style={{ width: `${percentage}%` }} 
                  />
                  
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200">{item.name}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">{percentage.toFixed(1)}% of total</span>
                    </div>
                    <div className="text-sm font-mono font-medium text-red-400">
                      {formatIndianCurrency(item.value)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
