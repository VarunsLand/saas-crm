import api from './api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  lead_id?: string;
  customer_id?: string;
  assigned_to: string;
  due_date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  completed_at?: string;
  lead?: {
    id: string;
    first_name: string;
    last_name?: string;
    status: string;
    phone_number?: string;
  };
  customer?: {
    id: string;
    first_name: string;
    last_name?: string;
    company?: string;
  };
  assignee?: {
    id: string;
    first_name: string;
    last_name?: string;
  };
}

export const taskService = {
  getAll: async (filter = 'ALL'): Promise<Task[]> => {
    const response = await api.get(`/tasks?filter=${filter}`);
    return response.data.data.tasks;
  },
  createTask: async (data: { 
    title: string; 
    description?: string; 
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'; 
    due_date: string; 
    assigned_to: string; 
    lead_id?: string; 
    customer_id?: string; 
  }): Promise<Task> => {
    const response = await api.post(`/tasks`, data);
    return response.data.data.task;
  },
  updateStatus: async (id: string, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
    const response = await api.patch(`/tasks/${id}`, { status });
    return response.data.data.task;
  }
};
