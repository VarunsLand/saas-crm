import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface LeadAvatarProps {
  firstName: string;
  lastName?: string | null;
  className?: string;
}

export function LeadAvatar({ firstName, lastName, className }: LeadAvatarProps) {
  const getInitials = () => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${f}${l}` || '?';
  };

  const getColors = () => {
    const colors = [
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    ];
    // Simple hash to consistently pick a color based on the first name
    const charCode = (firstName || 'A').charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <Avatar className={cn("h-10 w-10 border border-white dark:border-slate-900 shadow-sm", className)}>
      <AvatarFallback className={cn("font-medium", getColors())}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
