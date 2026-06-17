'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { DashboardMetrics } from '@/features/dashboard/components/DashboardMetrics';
import { DashboardActivity } from '@/features/dashboard/components/DashboardActivity';
import { DashboardCharts } from '@/features/dashboard/components/DashboardCharts';

export default function DashboardPage() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Welcome back, {currentUser.first_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening in your workspace today.
          </p>
        </div>

        {/* Top Section: Metrics */}
        <section>
          <DashboardMetrics />
        </section>

        {/* Charts Section: Lead Analytics */}
        <section>
          <DashboardCharts />
        </section>

        {/* Activity Timeline */}
        <section className="min-h-[400px]">
          <DashboardActivity />
        </section>
      </div>
    </div>
  );
}
