'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { invoiceService, Invoice, InvoiceStatus } from '@/services/invoice.service';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Mail, CheckCircle, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { formatIndianCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    invoiceService.getOne(params.id as string)
      .then((data) => {
        setInvoice(data);
        setError('');
      })
      .catch((err) => {
        setError('Failed to load invoice details');
        toast.error('Invoice not found');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (params.id) loadData();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await invoiceService.delete(invoice!.id);
      toast.success('Invoice deleted');
      router.push('/billing');
    } catch (err) {
      toast.error('Failed to delete invoice');
    }
  };

  const handleUpdateStatus = async (status: InvoiceStatus) => {
    try {
      await invoiceService.updateStatus(invoice!.id, status);
      toast.success(`Invoice marked as ${status}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setDownloadingPdf(true);
    try {
      await invoiceService.downloadPdf(invoice.id, invoice.invoice_number);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice) return;
    setSendingEmail(true);
    try {
      await invoiceService.sendInvoice(invoice.id);
      toast.success('Invoice emailed successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invoice email');
    } finally {
      setSendingEmail(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider">Paid</span>;
      case 'SENT': return <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider">Sent</span>;
      case 'OVERDUE': return <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider">Overdue</span>;
      case 'PARTIAL': return <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider">Partial</span>;
      default: return <span className="bg-slate-500/10 border border-slate-500/20 text-slate-400 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider">Draft</span>;
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-slate-500 animate-pulse font-mono">Loading invoice...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col h-full items-center justify-center space-y-4">
        <div className="text-red-400">{error || 'Invoice not found'}</div>
        <Link href="/billing">
          <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300">Back to Billing</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#050816] text-slate-200">
      <div className="flex-1 p-4 md:p-8 max-w-[1200px] mx-auto w-full space-y-6">
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/billing">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-white font-mono">{invoice.invoice_number}</h1>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-sm text-slate-500 mt-1">Created on {new Date(invoice.created_at || invoice.invoice_date).toLocaleDateString()}</p>
              {invoice.status === 'SENT' && invoice.sentAt && (
                <p className="text-sm text-indigo-400 font-medium mt-1">
                  Sent On: {new Date(invoice.sentAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleDownloadPdf} disabled={downloadingPdf} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600">
              <Download className="w-4 h-4 mr-2" /> {downloadingPdf ? 'Downloading...' : 'Download PDF'}
            </Button>
            {invoice.status === 'DRAFT' && (
              <Button onClick={handleSendEmail} disabled={sendingEmail} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 border border-blue-500/50">
                <Mail className="w-4 h-4 mr-2" /> {sendingEmail ? 'Sending...' : 'Send Invoice'}
              </Button>
            )}
            {(invoice.status === 'SENT' || invoice.status === 'PARTIAL' || invoice.status === 'OVERDUE') && (
              <Button onClick={handleSendEmail} disabled={sendingEmail} className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Mail className="w-4 h-4 mr-2" /> {sendingEmail ? 'Sending...' : 'Resend Invoice'}
              </Button>
            )}
            {(invoice.status === 'SENT' || invoice.status === 'OVERDUE' || invoice.status === 'PARTIAL') && (
              <Button onClick={() => handleUpdateStatus('PAID')} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500/50">
                <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
              </Button>
            )}
            <Button variant="outline" onClick={handleDelete} className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0B1220] border border-white/10 shadow-2xl rounded-xl p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <FileText className="w-64 h-64" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-white/5 pb-8 relative z-10">
            <div>
              <h2 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Billed To</h2>
              <div className="text-xl font-medium text-slate-200 mb-1">{invoice.customer_name}</div>
              {invoice.customer_email && <div className="text-sm text-slate-400">{invoice.customer_email}</div>}
              {invoice.customer_phone && <div className="text-sm text-slate-400">{invoice.customer_phone}</div>}
            </div>

            <div className="flex gap-12 text-right">
              <div>
                <h2 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Invoice Date</h2>
                <div className="text-sm text-slate-300 font-medium">
                  {new Date(invoice.invoice_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
              {invoice.due_date && (
                <div>
                  <h2 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Due Date</h2>
                  <div className="text-sm text-slate-300 font-medium">
                    {new Date(invoice.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="py-8 border-b border-white/5 relative z-10 overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3">Description</th>
                  <th className="py-3 text-right">Quantity</th>
                  <th className="py-3 text-right">Rate</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-4 font-medium text-slate-300">{item.description}</td>
                    <td className="py-4 text-right text-slate-400">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-400">{formatIndianCurrency(item.rate)}</td>
                    <td className="py-4 text-right font-mono text-slate-200">{formatIndianCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
            <div className="w-full md:w-1/2">
              <h2 className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">Notes</h2>
              <p className="text-sm text-slate-400 leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5">
                {invoice.notes || 'No additional notes or terms provided.'}
              </p>
            </div>

            <div className="w-full md:w-1/3 space-y-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono">{formatIndianCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>GST ({invoice.gst_rate}%)</span>
                <span className="font-mono">{formatIndianCurrency(invoice.gst_amount)}</span>
              </div>
              <div className="flex justify-between text-xl font-semibold text-white pt-4 border-t border-white/10">
                <span>Grand Total</span>
                <span className="font-mono text-indigo-400">{formatIndianCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
