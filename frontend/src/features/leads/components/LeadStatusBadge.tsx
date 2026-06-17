import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '../types';
import { cn } from '@/lib/utils';

export function LeadStatusBadge({ status, className }: { status: LeadStatus, className?: string }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'NEW':
        return { 
          bg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', 
          dot: 'bg-blue-500' 
        };
      case 'IN_PROGRESS':
        return { 
          bg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', 
          dot: 'bg-amber-500' 
        };
      case 'WON':
        return { 
          bg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', 
          dot: 'bg-emerald-500' 
        };
      case 'LOST':
        return { 
          bg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', 
          dot: 'bg-rose-500' 
        };
      default:
        return { 
          bg: 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800', 
          dot: 'bg-slate-500' 
        };
    }
  };

  const config = getStatusConfig();
  const label = status === 'IN_PROGRESS' ? 'In Progress' : status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <Badge 
      variant="outline" 
      className={cn("rounded-full px-2.5 py-0.5 font-medium flex items-center gap-1.5 border w-fit shadow-none", config.bg, className)}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {label}
    </Badge>
  );
}
