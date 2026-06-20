import api from './api';

export interface SearchLead {
  id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  status: string;
}

export interface SearchCustomer {
  id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  company?: string;
}

export interface SearchTask {
  id: string;
  title: string;
  status: string;
}

export interface SearchNote {
  id: string;
  title?: string;
  notes?: string;
  lead_id?: string;
  customer_id?: string;
}

export interface SearchResults {
  leads: SearchLead[];
  customers: SearchCustomer[];
  tasks: SearchTask[];
  notes: SearchNote[];
}

export const searchService = {
  globalSearch: async (query: string): Promise<SearchResults> => {
    if (!query || query.length < 2) return { leads: [], customers: [], tasks: [], notes: [] };
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  }
};
