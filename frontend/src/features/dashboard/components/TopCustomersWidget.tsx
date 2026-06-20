'use client';
import { useFinancialInsights } from '../hooks/useFinancialAnalytics';

export function TopCustomersWidget() {
  const { data, isLoading } = useFinancialInsights();

  if (isLoading) {
    return <div className="h-48 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-xl border border-slate-200 dark:border-slate-800" />;
  }

  const customers = data?.topCustomers || [];

  return (
    <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Top Customers</h3>
        <p className="text-xs text-slate-500 mt-1">Ranked by total revenue generated</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        {customers.length === 0 ? (
          <div className="p-6 text-center flex flex-col items-center justify-center h-full text-slate-500 text-sm">
            No customer revenue data yet
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {customers.map((customer: any, idx: number) => (
              <li key={customer.id || idx} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{customer.name}</span>
                  <span className="text-xs text-slate-500">{customer.company}</span>
                </div>
                <div className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                  ₹{customer.total_revenue.toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
