import api from './api';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  tax: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  notes?: string;
  status: InvoiceStatus;
  sentAt?: string;
  items?: InvoiceItem[];
  created_at?: string;
}

export const invoiceService = {
  getStats: async () => {
    const response = await api.get('/invoices/stats');
    return response.data.data.stats;
  },
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/invoices', { params });
    return response.data.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data.invoice;
  },
  create: async (data: Partial<Invoice>) => {
    const response = await api.post('/invoices', data);
    return response.data.data.invoice;
  },
  updateStatus: async (id: string, status: InvoiceStatus) => {
    const response = await api.put(`/invoices/${id}`, { status });
    return response.data.data.invoice;
  },
  downloadPdf: async (id: string, invoiceNumber: string) => {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  sendInvoice: async (id: string) => {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data.data.invoice;
  },
  delete: async (id: string) => {
    await api.delete(`/invoices/${id}`);
  }
};
