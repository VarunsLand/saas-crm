'use client';

import { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, Target } from 'lucide-react';
import { LeadStatusBadge } from './LeadStatusBadge';
import { WhatsAppButton } from './WhatsAppButton';
import { EmailButton } from './EmailButton';
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

  // Local Search Filter
  const filteredLeads = leads.filter((lead) => {
    const fullName = `${lead.first_name} ${lead.last_name || ''}`.toLowerCase();
    const email = (lead.email || '').toLowerCase();
    const phone = (lead.phone_number || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || phone.includes(search);
  });

  return (
    <Card className="shadow-sm border-slate-200/60 dark:border-slate-800/60">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name, email, or phone..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent">
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
                    className="cursor-pointer transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    onClick={() => router.push(`/leads/${lead.id}`)}
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {lead.first_name} {lead.last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{lead.email || '—'}</span>
                        {lead.email && (
                          <EmailButton email={lead.email} className="w-5 h-5 min-h-0 min-w-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{lead.phone_number}</span>
                        {lead.phone_number && (
                          <WhatsAppButton phoneNumber={lead.phone_number} className="w-5 h-5 min-h-0 min-w-0" />
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
