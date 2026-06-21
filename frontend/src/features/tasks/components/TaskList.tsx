'use client';

import { useTasks, useUpdateTask } from '../hooks/useTasks';
import { CreateTaskDialog } from './CreateTaskDialog';
import { format } from 'date-fns';
import { CalendarClock, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Task } from '../types';
import { EmptyState } from '@/components/ui/empty-state';

export function TaskList({ leadId }: { leadId: string }) {
  const { data, isLoading, isError, refetch, isRefetching } = useTasks(leadId);
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  const handleToggleComplete = (task: Task, checked: boolean) => {
    updateTask({
      id: task.id,
      data: { status: checked ? 'COMPLETED' : 'PENDING' }
    });
  };

  const tasks = data?.data?.tasks || [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Follow-up Tasks</CardTitle>
        <CreateTaskDialog leadId={leadId} />
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2 text-red-500">
            <AlertCircle className="w-6 h-6" />
            <p className="text-sm">Failed to load tasks.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
              Retry
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No follow-up tasks scheduled"
            description="Schedule a task to stay on top of this lead."
            className="p-6 h-48"
          />
        ) : (
          <div className="space-y-4 mt-4">
            {tasks.map((task: Task) => {
              const isCompleted = task.status === 'COMPLETED';
              const isOverdue = !isCompleted && new Date(task.due_date) < new Date(new Date().setHours(0,0,0,0));

              return (
                <div 
                  key={task.id} 
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                    isCompleted ? "bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-75" : "bg-card border-slate-200 dark:border-slate-800",
                    isOverdue ? "border-red-200 dark:border-red-900/50" : ""
                  )}
                >
                  <div className="pt-0.5">
                    <Checkbox 
                      checked={isCompleted} 
                      onCheckedChange={(checked) => handleToggleComplete(task, !!checked)}
                      disabled={isUpdating}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-sm font-medium leading-none",
                      isCompleted && "line-through text-muted-foreground"
                    )}>
                      Follow up with lead
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assigned to {task.assignee?.first_name} {task.assignee?.last_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-medium",
                      isCompleted ? "text-slate-500" : isOverdue ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                    )}>
                      {isCompleted ? "Completed" : isOverdue ? "Overdue" : "Due"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(task.due_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
