'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useDeleteLead } from '../hooks/useLeads';

interface DeleteLeadDialogProps {
  leadId: string;
  triggerContext?: 'icon' | 'button';
  redirectOnSuccess?: boolean;
}

export function DeleteLeadDialog({ leadId, triggerContext = 'icon', redirectOnSuccess = false }: DeleteLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteLead, isPending } = useDeleteLead();
  const router = useRouter();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    deleteLead(leadId, {
      onSuccess: () => {
        setOpen(false);
        if (redirectOnSuccess) {
          router.push('/leads');
        }
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          triggerContext === 'icon' ? (
            <button 
              className="w-full flex items-center px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm outline-none transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Lead
            </button>
          ) : (
            <Button variant="destructive" className="gap-2 w-full sm:w-auto">
              <Trash2 className="w-4 h-4" />
              Delete Lead
            </Button>
          )
        }
      />
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this lead?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The lead will be removed from the CRM and hidden from all users.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
