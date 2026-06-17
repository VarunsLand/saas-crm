'use client';

import { useDashboardActivity } from '../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Activity } from 'lucide-react';
import { InteractionRenderer } from '@/features/interactions/components/InteractionRenderer';

export function DashboardActivity() {
  const { data, isLoading, isError, refetch, isRefetching } = useDashboardActivity(15);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse border-4 border-white dark:border-slate-950 shrink-0 shadow-sm" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load recent activity.</p>
          <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activities = data?.data?.activity || [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No recent activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              When you interact with leads or their statuses change, the activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {activities.map((item) => (
              <InteractionRenderer key={item.id} interaction={item} showLeadContext={true} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
