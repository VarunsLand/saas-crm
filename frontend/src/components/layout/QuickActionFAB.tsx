'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Users, IndianRupee, FileMinus, CheckSquare, X } from 'lucide-react';

export function QuickActionFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const actions = [
    { label: 'Add Lead', icon: Target, color: 'text-sky-400', bg: 'bg-sky-500/10', href: '/leads?new=true' },
    { label: 'Add Customer', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/customers?new=true' },
    { label: 'Add Revenue', icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/revenue?new=true' },
    { label: 'Add Expense', icon: FileMinus, color: 'text-rose-400', bg: 'bg-rose-500/10', href: '/expenses?new=true' },
    { label: 'Add Task', icon: CheckSquare, color: 'text-amber-400', bg: 'bg-amber-500/10', href: '/tasks?new=true' },
  ];

  const handleAction = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-2"
          >
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: (actions.length - i - 1) * 0.05 }}
                  onClick={() => handleAction(action.href)}
                  className="flex items-center gap-3 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] border border-white/10 rounded-xl shadow-xl transition-colors group"
                >
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${action.bg} ${action.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen ? 'bg-slate-800 border border-white/10 text-slate-400 rotate-90' : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
}
