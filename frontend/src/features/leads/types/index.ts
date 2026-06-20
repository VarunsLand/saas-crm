export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Lead {
  id: string;
  tenant_id: string;
  source_id?: string | null;
  assigned_to?: string | null;
  first_name: string;
  last_name?: string | null;
  phone_number: string;
  email?: string | null;
  service?: string | null;
  description?: string | null;
  status: LeadStatus;
  converted_to_customer_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadsResponse {
  status: string;
  results: number;
  data: {
    leads: Lead[];
  };
}

export interface LeadResponse {
  status: string;
  data: {
    lead: Lead;
  };
}

export interface CreateLeadPayload {
  first_name: string;
  last_name?: string;
  email?: string;
  phone_number: string;
  description?: string;
}

export interface UpdateLeadStatusPayload {
  status: LeadStatus;
}
