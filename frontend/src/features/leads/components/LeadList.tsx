'use client';

import { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, Target, Download, MoreHorizontal, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { WhatsAppButton } from './WhatsAppButton';
import { EmailButton } from './EmailButton';
import { LeadAvatar } from './LeadAvatar';
import { LeadStatusBadge } from './LeadStatusBadge';
import { CopyButton } from '@/components/ui/copy-button';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DeleteLeadDialog } from './DeleteLeadDialog';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LeadList() {
  const { data, isLoading, isError } = useLeads();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (isLoading) {
    return (
      <Card className="shadow-sm border-border bg-card">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border">
            <div className="h-10 w-full max-w-sm bg-muted rounded animate-pulse" />
          </div>
          <TableSkeleton columns={5} rows={5} />
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
    IN_PROGRESS: leads.filter((l) => ['CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(l.status)).length,
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
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-t-2xl">
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

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto shrink-0 justify-end mt-4 sm:mt-0">
            <div className="relative w-full md:w-[350px] shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search leads by name, email, or phone..."
                className="pl-9 h-9 w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-full text-ellipsis"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full md:w-auto rounded-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shrink-0"
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No leads found"
            description={leads.length === 0 ? 'Start building your sales pipeline by creating your first lead.' : 'Try adjusting your search criteria.'}
          />
        ) : (
          <div className="w-full">
            {/* Mobile View: Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden p-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm relative">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <LeadAvatar firstName={lead.first_name} lastName={lead.last_name} />
                      <div>
                        <Link href={`/leads/${lead.id}`} className="font-medium hover:underline text-slate-100">
                          {lead.first_name} {lead.last_name}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    {/* Mobile: Keep Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <Link href={`/leads/${lead.id}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>View / Edit</span>
                          </DropdownMenuItem>
                        </Link>
                        {currentUser?.role === 'ADMIN' && (
                          <DeleteLeadDialog leadId={lead.id} triggerContext="icon" />
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-right truncate max-w-[200px]">{lead.email || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="text-right font-mono">{lead.phone_number || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Status</span>
                      <LeadStatusBadge status={lead.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table with Hover Actions */}
            <div className="hidden md:block overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-transparent border-b border-border">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-medium text-muted-foreground h-10">Name</TableHead>
                    <TableHead className="font-medium text-muted-foreground h-10">Contact Info</TableHead>
                    <TableHead className="font-medium text-muted-foreground h-10">Status</TableHead>
                    <TableHead className="font-medium text-muted-foreground h-10">Created</TableHead>
                    <TableHead className="w-[120px] h-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow
                      key={lead.id}
                      className="group transition-colors hover:bg-muted/30 border-b border-border/50 last:border-0 h-16"
                    >
                      <TableCell className="font-medium text-slate-100">
                        <div className="flex items-center gap-3">
                          <LeadAvatar firstName={lead.first_name} lastName={lead.last_name} />
                          <Link href={`/leads/${lead.id}`} className="hover:underline">
                            {lead.first_name} {lead.last_name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate max-w-[200px]">{lead.email || '—'}</span>
                          {lead.email && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <CopyButton text={lead.email} className="w-5 h-5" />
                              <EmailButton email={lead.email} className="w-5 h-5 min-h-0 min-w-0" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground font-mono">{lead.phone_number}</span>
                          {lead.phone_number && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <CopyButton text={lead.phone_number} className="w-5 h-5" />
                              <WhatsAppButton phoneNumber={lead.phone_number} className="w-5 h-5 min-h-0 min-w-0" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <LeadStatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Desktop: Inline Hover Actions */}
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/leads/${lead.id}`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent border-border hover:bg-muted">
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </Link>
                          {currentUser?.role === 'ADMIN' && (
                            <div className="inline-block">
                              <DeleteLeadDialog leadId={lead.id} triggerContext="icon" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
