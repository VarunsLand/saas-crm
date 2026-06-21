import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function DashboardEmptyState({ icon, title, description }: DashboardEmptyStateProps) {
  return (
    <div className="h-full w-full min-h-[180px] flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-12 h-12 mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shadow-inner"
      >
        {icon}
      </motion.div>
      <h4 className="text-sm font-medium text-slate-300 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
