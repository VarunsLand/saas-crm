import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '../services/leadsService';
import { CreateLeadPayload, UpdateLeadStatusPayload, LeadsResponse, LeadResponse, Lead } from '../types';
import { toast } from 'sonner';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsService.getLeads(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsService.getLead(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadPayload) => leadsService.createLead(data),
    onSuccess: () => {
      toast.success('Lead created successfully');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardActivity'] });
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to create lead';
      toast.error(message);
    },
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadStatusPayload }) => 
      leadsService.updateLeadStatus(id, data),
    
    // Optimistic Update
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['lead', id] });
      await queryClient.cancelQueries({ queryKey: ['leads'] });

      // Snapshot the previous value
      const previousLead = queryClient.getQueryData<LeadResponse>(['lead', id]);
      const previousLeads = queryClient.getQueryData<LeadsResponse>(['leads']);

      // Optimistically update to the new status for the detail page
      queryClient.setQueryData(['lead', id], (old: LeadResponse | undefined) => {
        if (!old?.data?.lead) return old;
        return {
          ...old,
          data: {
            ...old.data,
            lead: { ...old.data.lead, status: data.status },
          },
        };
      });

      // Optimistically update the list page
      queryClient.setQueryData(['leads'], (old: LeadsResponse | undefined) => {
        if (!old?.data?.leads) return old;
        return {
          ...old,
          data: {
            ...old.data,
            leads: old.data.leads.map((lead: Lead) =>
              lead.id === id ? { ...lead, status: data.status } : lead
            ),
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousLead, previousLeads, id };
    },
    
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousLead) {
        queryClient.setQueryData(['lead', context.id], context.previousLead);
      }
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
      toast.error('Failed to update lead status');
    },
    
    // Always refetch after error or success to ensure backend sync
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardActivity'] });
    },
    onSuccess: () => {
      toast.success('Lead status updated');
    }
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeadPayload> }) => 
      leadsService.updateLead(id, data),
    
    // Always refetch after error or success to ensure backend sync
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onSuccess: () => {
      toast.success('Lead updated successfully');
    },
    onError: () => {
      toast.error('Failed to update lead');
    }
  });
};

export const useImportLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { leads: CreateLeadPayload[] }) => leadsService.importLeads(data),
    onSuccess: (response) => {
      toast.success(`Imported ${response.data.importedCount} leads. Skipped ${response.data.skippedCount} duplicates.`);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardActivity'] });
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to import leads';
      toast.error(message);
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: (_, id) => {
      toast.success('Lead deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.removeQueries({ queryKey: ['leads', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardActivity'] });
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to delete lead';
      toast.error(message);
    },
  });
};
