'use client';
import { useState, useEffect } from 'react';
import { Customer, customerService } from '@/services/customer.service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

export function CustomerModal({ isOpen, onClose, onSuccess, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState({ first_name: '', last_name: '', company: '', email: '', phone_number: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({ first_name: customer.first_name || '', last_name: customer.last_name || '', company: customer.company || '', email: customer.email || '', phone_number: customer.phone_number || '' });
    } else {
      setFormData({ first_name: '', last_name: '', company: '', email: '', phone_number: '' });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (customer) {
        await customerService.update(customer.id, formData);
        toast.success('Customer updated successfully');
      } else {
        await customerService.create(formData);
        toast.success('Customer created successfully');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#0B1220] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white tracking-wide">{customer ? 'Edit Customer' : 'Create Customer'}</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">First Name *</label>
                  <input required type="text" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                    value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Last Name</label>
                  <input type="text" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                    value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Company</label>
                <input type="text" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                  value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Email Address</label>
                <input type="email" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Phone Number *</label>
                <input required type="text" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                  value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
                <Button type="button" onClick={onClose} className="bg-transparent border border-white/10 text-slate-300 hover:bg-white/5">Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 border border-indigo-500/50">
                  {loading ? 'Processing...' : 'Save Customer'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
