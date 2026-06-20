import api from '@/services/api';
import { Lead } from '@/features/leads/types';

export const pipelineService = {
  getLeads: async () => {
    const response = await api.get('/leads');
    return response.data.data.leads;
  },
  
  updateStage: async (leadId: string, newStage: string) => {
    const response = await api.patch(`/leads/${leadId}/stage`, { status: newStage });
    return response.data.data.lead;
  },

  convertToCustomer: async (leadId: string) => {
    const response = await api.post(`/leads/${leadId}/convert`);
    return response.data.data.customer;
  }
};
