'use client';
import { useState, useEffect } from 'react';
import { RevenueEntry, revenueService } from '@/services/revenue.service';
import { Customer, customerService } from '@/services/customer.service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entry?: RevenueEntry | null;
}

export function RevenueModal({ isOpen, onClose, onSuccess, entry }: RevenueModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({ customer_id: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isOpen) customerService.getAll().then(setCustomers).catch(() => {}); }, [isOpen]);

  useEffect(() => {
    if (entry) {
      setFormData({ customer_id: entry.customer_id || '', amount: entry.amount.toString(), description: entry.description || '', date: new Date(entry.date).toISOString().split('T')[0] });
    } else {
      setFormData({ customer_id: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    }
  }, [entry, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) || 0 };
      if (entry) await revenueService.update(entry.id, payload);
      else await revenueService.create(payload);
      toast.success(entry ? 'Revenue updated' : 'Revenue recorded');
      onSuccess();
      onClose();
    } catch { toast.error('Operation failed'); } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#0B1220] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white tracking-wide">{entry ? 'Edit Revenue' : 'Log Revenue'}</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Customer (Optional)</label>
                <select className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm appearance-none"
                  value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
                  <option value="">Direct Sale (No linked customer)</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Amount (₹) *</label>
                <input required type="number" step="0.01" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-emerald-400 font-mono text-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Transaction Date *</label>
                <input required type="date" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm [color-scheme:dark]"
                  value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Description</label>
                <input type="text" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Website development phase 1" />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
                <Button type="button" onClick={onClose} className="bg-transparent border border-white/10 text-slate-300 hover:bg-white/5">Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 border border-emerald-500/50">
                  {loading ? 'Processing...' : 'Confirm Ledger'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
