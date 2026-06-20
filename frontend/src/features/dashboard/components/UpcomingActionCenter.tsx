'use client';

import { useQuery } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { CheckSquare, Clock, CalendarDays, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function UpcomingActionCenter() {
  const { data: todayTasks, isLoading: isTodayLoading } = useQuery({
    queryKey: ['tasks', 'TODAY'],
    queryFn: () => taskService.getAll('TODAY')
  });

  const { data: overdueTasks, isLoading: isOverdueLoading } = useQuery({
    queryKey: ['tasks', 'OVERDUE'],
    queryFn: () => taskService.getAll('OVERDUE')
  });

  const { data: upcomingTasks, isLoading: isUpcomingLoading } = useQuery({
    queryKey: ['tasks', 'UPCOMING'],
    queryFn: () => taskService.getAll('UPCOMING')
  });

  const isLoading = isTodayLoading || isOverdueLoading || isUpcomingLoading;

  const renderTaskList = (tasks: { id: string, title: string, due_date: string, priority: string, status: string, lead_id?: string, customer_id?: string, lead?: { first_name: string, last_name?: string }, customer?: { first_name: string, last_name?: string } }[], emptyMessage: string) => {
    if (!tasks || tasks.length === 0) {
      return (
        <div className="py-6 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
          <CheckSquare className="w-6 h-6 mb-2 opacity-50" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${task.priority === 'HIGH' ? 'bg-red-500' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <div>
                <p className="text-sm font-medium text-slate-200">{task.title}</p>
                <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                  {task.lead_id && task.lead && <span>Lead: {task.lead.first_name} {task.lead.last_name}</span>}
                  {task.customer_id && task.customer && <span>Customer: {task.customer.first_name} {task.customer.last_name}</span>}
                  <span>•</span>
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
            <Link href="/tasks" className="mt-2 sm:mt-0 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 w-fit">
              View
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-400" /> Action Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">Your assigned operational tasks</p>
        </div>
        <Link href="/tasks" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group">
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          
          {/* Overdue Section */}
          {overdueTasks && overdueTasks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" /> Overdue ({overdueTasks.length})
              </h3>
              {renderTaskList(overdueTasks, 'No overdue tasks')}
            </div>
          )}

          {/* Today Section */}
          <div>
            <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Due Today
            </h3>
            {renderTaskList(todayTasks || [], 'No tasks due today')}
          </div>

          {/* Upcoming Section */}
          <div>
            <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5" /> Upcoming
            </h3>
            {renderTaskList(upcomingTasks?.slice(0, 5) || [], 'No upcoming tasks scheduled')}
          </div>

        </div>
      )}
    </div>
  );
}
