import api from './api';

export interface SearchResults {
  leads: any[];
  customers: any[];
  tasks: any[];
  notes: any[];
}

export const searchService = {
  globalSearch: async (query: string): Promise<SearchResults> => {
    if (!query || query.length < 2) return { leads: [], customers: [], tasks: [], notes: [] };
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  }
};
