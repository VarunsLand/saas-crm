import api from './api';

export interface RevenueEntry {
  id: string;
  customer_id?: string;
  amount: number;
  description: string;
  date: string;
  customer?: { id: string; first_name: string; last_name: string; company?: string };
}

export const revenueService = {
  getAll: async () => {
    const response = await api.get('/revenue');
    return response.data.data.entries;
  },
  create: async (data: Partial<RevenueEntry>) => {
    const response = await api.post('/revenue', data);
    return response.data.data.entry;
  },
  update: async (id: string, data: Partial<RevenueEntry>) => {
    const response = await api.patch(`/revenue/${id}`, data);
    return response.data.data.entry;
  },
  delete: async (id: string) => {
    await api.delete(`/revenue/${id}`);
  }
};
