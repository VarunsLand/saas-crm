'use client';
import { useFinancialCharts } from '../hooks/useFinancialAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { formatIndianCurrency } from '@/lib/utils';
import { DashboardEmptyState } from '@/components/ui/DashboardEmptyState';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProfitTrendPoint {
  month: string;
  profit: number;
}

export function ProfitTrendChart() {
  const { data, isLoading } = useFinancialCharts();

  const fullData: ProfitTrendPoint[] = useMemo(() => {
    return (data?.revenueExpenseTrend || []).map((d: { month: string, revenue: number, expense: number }) => ({
      month: d.month,
      profit: d.revenue - d.expense
    }));
  }, [data?.revenueExpenseTrend]);

  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '12M' | 'RANGE'>('12M');
  const [rangeStartIdx, setRangeStartIdx] = useState<number>(0);
  const [rangeEndIdx, setRangeEndIdx] = useState<number>(11);
  const [tempStartIdx, setTempStartIdx] = useState<number>(0);
  const [tempEndIdx, setTempEndIdx] = useState<number>(11);

  useEffect(() => {
    if (fullData.length > 0) {
      setRangeEndIdx(fullData.length - 1);
      setTempEndIdx(fullData.length - 1);
    }
  }, [fullData.length]);

  const filteredData = useMemo(() => {
    if (!fullData || fullData.length === 0) return [];
    if (timeRange === '3M') return fullData.slice(-3);
    if (timeRange === '6M') return fullData.slice(-6);
    if (timeRange === '12M') return fullData;
    if (timeRange === 'RANGE') {
      return fullData.slice(rangeStartIdx, rangeEndIdx + 1);
    }
    return fullData;
  }, [fullData, timeRange, rangeStartIdx, rangeEndIdx]);

  const handleApply = () => {
    setRangeStartIdx(tempStartIdx);
    setRangeEndIdx(tempEndIdx);
  };

  const hasData = filteredData.some((d: { profit: number }) => d.profit !== 0);

  if (isLoading) {
    return <div className="h-[250px] w-full bg-white/5 border border-white/10 rounded-xl animate-pulse" />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col h-full bg-[#0B1220] rounded-xl border border-white/10 p-5 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
        <div>
          <h3 className="text-sm font-medium text-slate-200 tracking-wide">Net Profit Trend</h3>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">
            {timeRange === '12M' ? 'Trailing 12 Months' : timeRange === '6M' ? 'Trailing 6 Months' : timeRange === '3M' ? 'Trailing 3 Months' : 'Custom Range'}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            {['3M', '6M', '12M', 'Range'].map((range) => {
              const val = range.toUpperCase() as '3M' | '6M' | '12M' | 'RANGE';
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(val)}
                  className={cn(
                    "px-3 py-1 text-[11px] font-medium rounded-md transition-all",
                    timeRange === val 
                      ? "bg-indigo-500 text-white shadow-sm" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  )}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {timeRange === 'RANGE' && fullData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="flex items-center gap-3 mb-4 text-xs bg-slate-800/30 p-2 rounded-lg border border-slate-700/30 w-fit z-20"
        >
          <span className="text-slate-500 font-medium">From</span>
          <select 
            value={tempStartIdx} 
            onChange={(e) => setTempStartIdx(Number(e.target.value))}
            className="bg-[#0f172a] border border-slate-700 rounded text-slate-300 px-2 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
          >
            {fullData.map((d: ProfitTrendPoint, idx: number) => (
              <option key={`start-${idx}`} value={idx} disabled={idx > tempEndIdx}>{d.month}</option>
            ))}
          </select>
          <span className="text-slate-500 font-medium ml-1">To</span>
          <select 
            value={tempEndIdx} 
            onChange={(e) => setTempEndIdx(Number(e.target.value))}
            className="bg-[#0f172a] border border-slate-700 rounded text-slate-300 px-2 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
          >
            {fullData.map((d: ProfitTrendPoint, idx: number) => (
              <option key={`end-${idx}`} value={idx} disabled={idx < tempStartIdx}>{d.month}</option>
            ))}
          </select>
          <button 
            onClick={handleApply}
            className="ml-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/50 px-3 py-1.5 rounded-md transition-colors"
          >
            Apply
          </button>
        </motion.div>
      )}
      
      <div className="flex-1 w-full min-h-[200px] z-10">
        {!hasData ? (
           <DashboardEmptyState 
             icon={<TrendingUp className="w-5 h-5 opacity-50" />}
             title={timeRange !== '12M' ? "No data available for selected period." : "No Profit Data Yet"}
             description={timeRange !== '12M' ? "Try adjusting your time range filter." : "Log revenue and expenses to visualize your profit trajectory."}
           />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => formatIndianCurrency(val)} />
              <Tooltip 
                formatter={(value: unknown) => formatIndianCurrency(value as number)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
