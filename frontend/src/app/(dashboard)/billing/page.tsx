'use client';
import { useEffect, useState } from 'react';
import { invoiceService, Invoice } from '@/services/invoice.service';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, ReceiptText } from 'lucide-react';
import { InvoiceSummaryCards } from '@/features/billing/components/InvoiceSummaryCards';
import { InvoiceModal } from '@/features/billing/components/InvoiceModal';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatIndianCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      invoiceService.getAll({ search }),
      invoiceService.getStats()
    ])
      .then(([invoiceData, statsData]) => {
        setInvoices(invoiceData.invoices);
        setStats(statsData);
        setError('');
      })
      .catch((err) => setError('Failed to load invoices'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    try {
      await invoiceService.delete(id);
      toast.success('Deleted successfully');
      loadData();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Paid</span>;
      case 'SENT': return <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Sent</span>;
      case 'OVERDUE': return <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Overdue</span>;
      case 'PARTIAL': return <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Partial</span>;
      default: return <span className="bg-slate-500/10 border border-slate-500/20 text-slate-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Draft</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#050816] text-slate-200">
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-6">
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Billing & Invoices</h1>
            <p className="text-sm text-slate-500 mt-1">Manage customer invoices and track payments.</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/20 border border-indigo-500/50 transition-all hover:scale-105">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </motion.div>

        {!loading && (
          <InvoiceSummaryCards stats={stats} />
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0B1220] border border-white/10 shadow-2xl rounded-xl overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-white/5 flex gap-4 items-center bg-white/[0.02]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search invoice number or customer..." 
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-colors"
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4">
                <TableSkeleton columns={6} rows={5} />
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-400">{error}</div>
            ) : invoices.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No invoices found"
                description={search ? "No invoices match your search query." : "You haven't created any invoices yet."}
                action={{ label: 'Create Invoice', onClick: () => setModalOpen(true) }}
              />
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-[#0B1220] sticky top-0 border-b border-white/10 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((invoice, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      key={invoice.id} className="hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/billing/${invoice.id}`} className="font-mono text-indigo-400 font-medium hover:underline">
                          {invoice.invoice_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-200">{invoice.customer_name}</span>
                          {invoice.customer_email && <span className="text-[11px] text-slate-500">{invoice.customer_email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(invoice.invoice_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-200 font-medium text-base">
                        {formatIndianCurrency(invoice.total)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/billing/${invoice.id}`}>
                          <Button variant="outline" size="sm" className="bg-black/50 border-white/10 hover:bg-white/10 text-slate-300">
                            View
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
      <InvoiceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadData} />
    </div>
  );
}
