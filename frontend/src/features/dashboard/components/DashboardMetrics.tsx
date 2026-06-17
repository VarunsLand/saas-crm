'use client';

import { useDashboardMetrics } from '../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Frown, CalendarCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardMetrics() {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded mt-1 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load metrics.</p>
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const metrics = data?.data?.metrics;

  if (!metrics) {
    return null; // Empty state realistically shouldn't happen unless data structure is completely wrong
  }

  const items = [
    {
      title: 'Total Leads',
      value: metrics.total_leads,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Leads Won',
      value: metrics.leads_won,
      icon: Target,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      title: 'Leads Lost',
      value: metrics.leads_lost,
      icon: Frown,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    },
    {
      title: 'Tasks Due Today',
      value: metrics.tasks_due_today,
      icon: CalendarCheck,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} className="bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {item.title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl ${item.bgColor} transition-transform group-hover:scale-110`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
