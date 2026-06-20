import api from './api';

export interface ExpenseEntry {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export const expenseService = {
  getAll: async () => {
    const response = await api.get('/expenses');
    return response.data.data.entries;
  },
  create: async (data: Partial<ExpenseEntry>) => {
    const response = await api.post('/expenses', data);
    return response.data.data.entry;
  },
  update: async (id: string, data: Partial<ExpenseEntry>) => {
    const response = await api.patch(`/expenses/${id}`, data);
    return response.data.data.entry;
  },
  delete: async (id: string) => {
    await api.delete(`/expenses/${id}`);
  }
};
