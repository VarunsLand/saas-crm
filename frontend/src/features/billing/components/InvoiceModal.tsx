'use client';
import { useState, useEffect } from 'react';
import { Invoice, invoiceService, InvoiceItem } from '@/services/invoice.service';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatIndianCurrency } from '@/lib/utils';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InvoiceModal({ isOpen, onClose, onSuccess }: InvoiceModalProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  const [gstRateMode, setGstRateMode] = useState<number | 'Custom'>(18);
  const [customGstRate, setCustomGstRate] = useState<number>(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: ''
      });
      setItems([{ description: '', quantity: 1, rate: 0, amount: 0 }]);
      setGstRateMode(18);
      setCustomGstRate(0);
    }
  }, [isOpen]);

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === 'quantity' || field === 'rate') {
      item[field] = parseFloat(value as string) || 0;
      item.amount = item.quantity * item.rate;
    } else {
      (item as any)[field] = value;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const activeGstRate = gstRateMode === 'Custom' ? customGstRate : gstRateMode;
  const validGstRate = Math.min(Math.max(activeGstRate || 0, 0), 100);
  
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = (subtotal * validGstRate) / 100;
  const total = subtotal + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (items.length === 0 || items.some(i => !i.description.trim() || i.quantity <= 0 || i.rate < 0)) {
      toast.error('Please provide valid invoice items');
      return;
    }

    setLoading(true);
    try {
      await invoiceService.create({
        ...formData,
        items,
        gst_rate: validGstRate
      });
      toast.success('Invoice created successfully');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#0B1220] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/[0.02] shrink-0">
              <h2 className="text-lg font-semibold text-white tracking-wide">Create New Invoice</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                
                {/* Customer Information */}
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">1</div>
                    Customer Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Name *</label>
                      <input required type="text" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                        value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} placeholder="e.g. Acme Corp" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Email</label>
                      <input type="email" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                        value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} placeholder="billing@acme.com" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Phone</label>
                      <input type="text" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                        value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} placeholder="+91 9876543210" />
                    </div>
                  </div>
                </div>

                {/* Invoice Information */}
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">2</div>
                    Invoice Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Invoice Date *</label>
                      <input required type="date" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm [color-scheme:dark]"
                        value={formData.invoice_date} onChange={e => setFormData({...formData, invoice_date: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Due Date</label>
                      <input type="date" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm [color-scheme:dark]"
                        value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                    </div>
                    
                    {/* GST Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">GST Rate</label>
                      <select 
                        className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm appearance-none"
                        value={gstRateMode} 
                        onChange={e => setGstRateMode(e.target.value === 'Custom' ? 'Custom' : Number(e.target.value))}
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    {gstRateMode === 'Custom' && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Custom GST %</label>
                        <input required type="number" min="0" max="100" step="any" className="w-full px-3 py-2.5 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                          value={customGstRate} onChange={e => setCustomGstRate(parseFloat(e.target.value) || 0)} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">3</div>
                    Line Items
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-2">
                      <div className="col-span-6 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Description</div>
                      <div className="col-span-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold text-right">Qty</div>
                      <div className="col-span-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold text-right">Rate</div>
                      <div className="col-span-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold text-right">Amount</div>
                    </div>

                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start bg-white/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-lg border border-white/5 sm:border-none relative group">
                        <div className="col-span-1 sm:col-span-6">
                          <label className="sm:hidden text-[10px] uppercase text-slate-500 mb-1 block">Description</label>
                          <input required type="text" className="w-full px-3 py-2 border border-white/10 rounded-md bg-black/50 text-slate-200 text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                            value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Service or product name" />
                        </div>
                        <div className="col-span-1 sm:col-span-2 grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-0">
                          <div>
                            <label className="sm:hidden text-[10px] uppercase text-slate-500 mb-1 block">Qty</label>
                            <input required type="number" min="1" step="any" className="w-full px-3 py-2 border border-white/10 rounded-md bg-black/50 text-slate-200 text-sm text-left sm:text-right focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                              value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                          </div>
                          <div className="sm:hidden">
                            <label className="text-[10px] uppercase text-slate-500 mb-1 block">Rate</label>
                            <input required type="number" min="0" step="any" className="w-full px-3 py-2 border border-white/10 rounded-md bg-black/50 text-slate-200 text-sm text-left focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                              value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)} />
                          </div>
                        </div>
                        <div className="hidden sm:block col-span-2">
                           <input required type="number" min="0" step="any" className="w-full px-3 py-2 border border-white/10 rounded-md bg-black/50 text-slate-200 text-sm text-right focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                              value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)} />
                        </div>
                        <div className="col-span-1 sm:col-span-2 flex items-center justify-between sm:justify-end gap-2 h-full py-2">
                          <label className="sm:hidden text-[10px] uppercase text-slate-500">Amount</label>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-300">{formatIndianCurrency(item.amount)}</span>
                            {items.length > 1 && (
                              <button type="button" onClick={() => removeItem(index)} className="text-slate-500 hover:text-red-400 p-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2">
                      <Button type="button" variant="outline" onClick={addItem} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300 text-xs py-1 h-8">
                        <Plus className="w-3 h-3 mr-1" /> Add Line Item
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <div className="w-full sm:w-1/2 md:w-1/3 space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatIndianCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>GST Rate</span>
                        <span className="font-mono">{validGstRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>GST Amount</span>
                        <span className="font-mono">{formatIndianCurrency(gstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold text-white pt-2 border-t border-white/10">
                        <span>Grand Total</span>
                        <span className="font-mono text-indigo-400">{formatIndianCurrency(total)}</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="pt-6 border-t border-white/5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 block">Notes / Terms</label>
                  <textarea className="w-full px-3 py-2 border border-white/10 rounded-lg bg-black/50 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm min-h-[80px]"
                    value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Thank you for your business!" />
                </div>

              </div>

              <div className="p-5 border-t border-white/5 bg-black/20 flex justify-end gap-3 shrink-0">
                <Button type="button" onClick={onClose} className="bg-transparent border border-white/10 text-slate-300 hover:bg-white/5">Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 border border-indigo-500/50">
                  {loading ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
