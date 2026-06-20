import api from './api';

export interface Note {
  id: string;
  type: string;
  title: string | null;
  notes: string | null;
  lead_id: string | null;
  customer_id: string | null;
  created_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export const noteService = {
  getNotes: async (params: { leadId?: string; customerId?: string }): Promise<Note[]> => {
    const query = new URLSearchParams();
    if (params.leadId) query.append('leadId', params.leadId);
    if (params.customerId) query.append('customerId', params.customerId);
    
    const response = await api.get(`/notes?${query.toString()}`);
    return response.data.data.interactions;
  },

  createNote: async (data: { type: string; title?: string; notes: string; leadId?: string; customerId?: string }): Promise<Note> => {
    const response = await api.post(`/notes`, data);
    return response.data.data.interaction;
  }
};
