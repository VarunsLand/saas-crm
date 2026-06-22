'use client';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceSummaryCardsProps {
  stats: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
}

export function InvoiceSummaryCards({ stats }: InvoiceSummaryCardsProps) {
  const cards = [
    {
      title: 'Total Invoices',
      value: stats.total,
      icon: FileText,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
    {
      title: 'Paid',
      value: stats.paid,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            "p-5 rounded-xl border bg-[#0B1220] shadow-xl flex items-center justify-between",
            card.borderColor
          )}
        >
          <div>
            <p className="text-sm text-slate-400 font-medium">{card.title}</p>
            <h4 className="text-2xl font-bold text-white mt-1">{card.value}</h4>
          </div>
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", card.bgColor)}>
            <card.icon className={cn("w-6 h-6", card.color)} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
