import api from './api';

export interface Customer {
  id: string;
  first_name: string;
  last_name?: string;
  company?: string;
  email?: string;
  phone_number: string;
  total_revenue: number;
  assigned_to?: string;
}

export const customerService = {
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data.data.customers;
  },
  getById: async (id: string) => {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
  },
  create: async (data: Partial<Customer>) => {
    const response = await api.post('/customers', data);
    return response.data.data.customer;
  },
  update: async (id: string, data: Partial<Customer>) => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data.data.customer;
  },
  delete: async (id: string) => {
    await api.delete(`/customers/${id}`);
  }
};
