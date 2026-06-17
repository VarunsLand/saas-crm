'use client';

import { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, Target, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WhatsAppButton } from './WhatsAppButton';
import { EmailButton } from './EmailButton';
import { LeadAvatar } from './LeadAvatar';
import { LeadStatusBadge } from './LeadStatusBadge';
import { CopyButton } from '@/components/ui/copy-button';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

export function LeadList() {
  const { data, isLoading, isError } = useLeads();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (isLoading) {
    return (
      <Card className="shadow-sm border-slate-200/60 dark:border-slate-800/60">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <div className="h-10 w-full max-w-sm bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400">
        <p>Failed to load leads. Please try again later.</p>
      </div>
    );
  }

  const leads = data?.data?.leads || [];

  // Calculate counts for filters
  const counts = {
    ALL: leads.length,
    NEW: leads.filter((l) => l.status === 'NEW').length,
    IN_PROGRESS: leads.filter((l) => l.status === 'IN_PROGRESS').length,
    WON: leads.filter((l) => l.status === 'WON').length,
    LOST: leads.filter((l) => l.status === 'LOST').length,
  };

  const filters = [
    { id: 'ALL', label: 'All' },
    { id: 'NEW', label: 'New' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'WON', label: 'Won' },
    { id: 'LOST', label: 'Lost' },
  ];

  // Combined Search and Status Filter
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchTerm) return true;
    
    const fullName = `${lead.first_name} ${lead.last_name || ''}`.toLowerCase();
    const email = (lead.email || '').toLowerCase();
    const phone = (lead.phone_number || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || phone.includes(search);
  });

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Created Date'];
    const rows = filteredLeads.map((lead) => [
      `"${(lead.first_name + ' ' + (lead.last_name || '')).trim()}"`,
      `"${lead.email || ''}"`,
      `"${lead.phone_number || ''}"`,
      `"${lead.status}"`,
      `"${new Date(lead.created_at).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `leads-export-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredLeads.length} leads successfully`);
  };

  return (
    <Card className="shadow-sm border-slate-200/60 dark:border-slate-800/60">
      <CardContent className="p-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-t-2xl">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {filters.map((filter) => {
              const isActive = statusFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    isActive 
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-slate-200/60 dark:border-slate-700" 
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent"
                  )}
                >
                  {filter.label}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-xs",
                    isActive 
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" 
                      : "bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                  )}>
                    {counts[filter.id as keyof typeof counts]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <div className="relative w-full sm:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search leads..."
                className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shrink-0"
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No leads found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {leads.length === 0 ? 'Get started by creating your first lead.' : 'Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Contact Info</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 data-[state=selected]:bg-muted border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                    onClick={() => router.push(`/leads/${lead.id}`)}
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <LeadAvatar firstName={lead.first_name} lastName={lead.last_name} />
                        <span>{lead.first_name} {lead.last_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{lead.email || '—'}</span>
                        {lead.email && (
                          <>
                            <CopyButton text={lead.email} className="w-5 h-5" />
                            <EmailButton email={lead.email} className="w-5 h-5 min-h-0 min-w-0" />
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{lead.phone_number}</span>
                        {lead.phone_number && (
                          <>
                            <CopyButton text={lead.phone_number} className="w-5 h-5" />
                            <WhatsAppButton phoneNumber={lead.phone_number} className="w-5 h-5 min-h-0 min-w-0" />
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
