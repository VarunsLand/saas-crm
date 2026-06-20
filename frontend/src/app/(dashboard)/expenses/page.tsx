'use client';
import { useEffect, useState } from 'react';
import { expenseService, ExpenseEntry } from '@/services/expense.service';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Search, Filter, Activity } from 'lucide-react';
import { ExpenseModal } from '@/features/expenses/components/ExpenseModal';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ExpensesPage() {
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ExpenseEntry | null>(null);

  const loadData = () => {
    setLoading(true);
    expenseService.getAll()
      .then((data) => { setEntries(data); setError(''); })
      .catch((err) => setError('Failed to load expenses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (e: ExpenseEntry) => { setSelectedEntry(e); setModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense entry? This cannot be undone.')) return;
    try {
      await expenseService.delete(id);
      toast.success('Deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const filtered = entries.filter(e => 
    (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full bg-[#050816] text-slate-200">
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-6">
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Expense Ledger</h1>
            <p className="text-sm text-slate-500 mt-1">Manage outbound operational costs and burn rate.</p>
          </div>
          <Button onClick={() => { setSelectedEntry(null); setModalOpen(true); }} className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-500/20 border border-red-500/50 transition-all hover:scale-105">
            <Plus className="mr-2 h-4 w-4" /> Log Expense
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0B1220] border border-white/10 shadow-2xl rounded-xl overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-white/5 flex gap-4 items-center bg-white/[0.02]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search categories or descriptions..." 
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-red-500/50 transition-colors"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5">
              <Filter className="w-4 h-4 mr-2" /> Filter Category
            </Button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse font-mono text-sm">Synchronizing ledger...</div>
            ) : error ? (
              <div className="p-12 text-center text-red-400">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                  <Activity className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No expenses recorded</h3>
                <p className="text-slate-500 max-w-sm mb-6">Your ledger is empty. Log your first operational expense to track your profit margins.</p>
                <Button onClick={() => { setSelectedEntry(null); setModalOpen(true); }} className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                  Log Expense
                </Button>
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-[#0B1220] sticky top-0 border-b border-white/10 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((e, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      key={e.id} className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="text-slate-200">{new Date(e.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-xs text-slate-300 font-medium tracking-wide">{e.category}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{e.description || '-'}</td>
                      <td className="px-6 py-4 font-mono text-red-400 font-semibold text-base">
                        -₹{e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(e)} className="bg-black/50 border-white/10 hover:bg-white/10 h-8 w-8 p-0"><Edit className="w-4 h-4 text-slate-300" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(e.id)} className="bg-black/50 border-red-500/20 hover:bg-red-500/20 h-8 w-8 p-0"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
      <ExpenseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadData} entry={selectedEntry} />
    </div>
  );
}
