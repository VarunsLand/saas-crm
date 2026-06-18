import api from '@/services/api';
import { LeadsResponse, LeadResponse, CreateLeadPayload, UpdateLeadStatusPayload } from '../types';

export const leadsService = {
  async getLeads(): Promise<LeadsResponse> {
    const response = await api.get('/leads');
    return response.data;
  },

  async getLead(id: string): Promise<LeadResponse> {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  async createLead(data: CreateLeadPayload): Promise<LeadResponse> {
    const response = await api.post('/leads', data);
    return response.data;
  },

  async updateLeadStatus(id: string, data: UpdateLeadStatusPayload): Promise<LeadResponse> {
    const response = await api.patch(`/leads/${id}`, data);
    return response.data;
  },

  async updateLead(id: string, data: Partial<CreateLeadPayload>): Promise<LeadResponse> {
    const response = await api.patch(`/leads/${id}`, data);
    return response.data;
  },

  async importLeads(data: { leads: CreateLeadPayload[] }): Promise<{ status: string; data: { importedCount: number; skippedCount: number } }> {
    const response = await api.post('/leads/import', data);
    return response.data;
  },

  async deleteLead(id: string): Promise<{ status: string; message: string }> {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  }
};
