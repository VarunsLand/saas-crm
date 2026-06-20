'use client';
import { useEffect, useState } from 'react';
import { customerService, Customer } from '@/services/customer.service';
import { Button } from '@/components/ui/button';
import { Plus, Users, Edit, Trash2, Search, Filter } from 'lucide-react';
import { CustomerModal } from '@/features/customers/components/CustomerModal';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const loadCustomers = () => {
    setLoading(true);
    customerService.getAll()
      .then((data) => {
        setCustomers(data);
        setError('');
      })
      .catch((err) => setError('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCustomers(); }, []);

  const handleEdit = (c: Customer) => { setSelectedCustomer(c); setModalOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer? This cannot be undone.')) return;
    try {
      await customerService.delete(id);
      toast.success('Customer deleted');
      loadCustomers();
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const filtered = customers.filter(c => 
    (c.first_name + ' ' + c.last_name).toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full bg-[#050816] text-slate-200">
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-6">
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Customers</h1>
            <p className="text-sm text-slate-500 mt-1">Manage client relationships and lifetime value.</p>
          </div>
          <Button onClick={() => { setSelectedCustomer(null); setModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/20 border border-indigo-500/50 transition-all hover:scale-105">
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0B1220] border border-white/10 shadow-2xl rounded-xl overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-white/5 flex gap-4 items-center bg-white/[0.02]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search customers or companies..." 
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse font-mono text-sm">Loading data sequence...</div>
            ) : error ? (
              <div className="p-12 text-center text-red-400">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No customers found</h3>
                <p className="text-slate-500 max-w-sm mb-6">Your customer database is empty. Add your first customer to start tracking revenue.</p>
                <Button onClick={() => { setSelectedCustomer(null); setModalOpen(true); }} className="bg-white/5 hover:bg-white/10 text-white border border-white/10">
                  Create Customer
                </Button>
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-[#0B1220] sticky top-0 border-b border-white/10 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">LTV (Revenue)</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((c, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      key={c.id} className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/customers/${c.id}`} className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                          {c.first_name} {c.last_name}
                        </Link>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">ID: {c.id.split('-')[0]}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {c.company ? (
                          <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-xs">{c.company}</span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{c.email || '-'}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{c.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-emerald-400">
                        ₹{(c.total_revenue || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(c)} className="bg-black/50 border-white/10 hover:bg-white/10 h-8 w-8 p-0"><Edit className="w-4 h-4 text-slate-300" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(c.id)} className="bg-black/50 border-red-500/20 hover:bg-red-500/20 h-8 w-8 p-0"><Trash2 className="w-4 h-4 text-red-400" /></Button>
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
      <CustomerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadCustomers} customer={selectedCustomer} />
    </div>
  );
}
