'use client';
import { useEffect, useState, useMemo } from 'react';
import { expenseService, ExpenseEntry } from '@/services/expense.service';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Search, Filter, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { ExpenseModal } from '@/features/expenses/components/ExpenseModal';
import { ExpenseAnalyticsBarChart } from '@/features/expenses/components/ExpenseAnalyticsBarChart';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatIndianCurrency } from '@/lib/utils';

export default function ExpensesPage() {
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  
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

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, { month: string; totalAmount: number; entries: ExpenseEntry[] }> = {};
    
    filtered.forEach(e => {
      const date = new Date(e.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = { month: monthYear, totalAmount: 0, entries: [] };
      }
      groups[monthYear].totalAmount += e.amount;
      groups[monthYear].entries.push(e);
    });

    return Object.values(groups);
  }, [filtered]);

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

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

        {!loading && entries.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <ExpenseAnalyticsBarChart entries={entries} />
          </motion.div>
        )}

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

          <div className="flex flex-col">
            {loading ? (
              <div className="p-4">
                <TableSkeleton columns={5} rows={3} />
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-400">{error}</div>
            ) : groupedExpenses.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No expenses recorded"
                description="Your ledger is empty. Log your first operational expense to track your profit margins."
                action={{ label: 'Log Expense', onClick: () => { setSelectedEntry(null); setModalOpen(true); } }}
              />
            ) : (
              <div className="divide-y divide-white/5">
                {groupedExpenses.map((group) => {
                  const isExpanded = expandedMonths[group.month];
                  return (
                    <div key={group.month} className="flex flex-col">
                      <div 
                        onClick={() => toggleMonth(group.month)}
                        className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors group/row"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors group-hover/row:bg-white/10">
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-slate-200">{group.month}</h3>
                            <p className="text-sm text-slate-500">{group.entries.length} {group.entries.length === 1 ? 'Entry' : 'Entries'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-red-400 font-semibold text-xl">-{formatIndianCurrency(group.totalAmount)}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Expense</p>
                        </div>
                      </div>

                      {isExpanded && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-black/20 border-t border-b border-white/5"
                        >
                          {/* Mobile View: Cards */}
                          <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                            {group.entries.map((e) => (
                              <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative group">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="bg-white/10 border border-white/10 px-2 py-1 rounded-md text-[10px] text-slate-300 font-semibold tracking-wide uppercase">
                                      {e.category}
                                    </span>
                                    <div className="text-xs text-slate-400 mt-2">
                                      {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(e)} className="h-8 w-8 text-slate-400 hover:text-white">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="h-8 w-8 text-red-400 hover:text-red-300">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-end mt-2 pt-3 border-t border-white/5">
                                  <span className="text-sm text-slate-300 truncate max-w-[200px]">{e.description || 'No description'}</span>
                                  <span className="font-mono text-red-400 font-bold">-{formatIndianCurrency(e.amount)}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Desktop View */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                              <thead className="text-slate-500 uppercase tracking-wider text-[11px] font-semibold bg-white/[0.02]">
                                <tr>
                                  <th className="px-6 py-3 pl-20">Transaction Date</th>
                                  <th className="px-6 py-3">Category</th>
                                  <th className="px-6 py-3">Description</th>
                                  <th className="px-6 py-3">Amount</th>
                                  <th className="px-6 py-3 text-right pr-10">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {group.entries.map((e, i) => (
                                  <tr key={e.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-3 pl-20">
                                      <div className="text-slate-300">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                    </td>
                                    <td className="px-6 py-3">
                                      <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-xs text-slate-300 font-medium tracking-wide">{e.category}</span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-400">{e.description || '-'}</td>
                                    <td className="px-6 py-3 font-mono text-red-400 font-medium">
                                      -{formatIndianCurrency(e.amount)}
                                    </td>
                                    <td className="px-6 py-3 text-right pr-10">
                                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(e)} className="bg-black/50 border-white/10 hover:bg-white/10 h-8 w-8 p-0"><Edit className="w-4 h-4 text-slate-300" /></Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(e.id)} className="bg-black/50 border-red-500/20 hover:bg-red-500/20 h-8 w-8 p-0"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <ExpenseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadData} entry={selectedEntry} />
    </div>
  );
}
