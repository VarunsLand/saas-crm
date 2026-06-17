'use client';

import { use } from 'react';
import { useLead, useUpdateLeadStatus } from '@/features/leads/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, User, Phone, Mail, Clock } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadStatusBadge } from '@/features/leads/components/LeadStatusBadge';
import { format } from 'date-fns';
import { LeadStatus } from '@/features/leads/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InteractionTimeline } from '@/features/interactions/components/InteractionTimeline';
import { TaskList } from '@/features/tasks/components/TaskList';
import { WhatsAppButton } from '@/features/leads/components/WhatsAppButton';
import { EmailButton } from '@/features/leads/components/EmailButton';
import { LeadAvatar } from '@/features/leads/components/LeadAvatar';
import { CopyButton } from '@/components/ui/copy-button';

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;

  const { data, isLoading, isError } = useLead(leadId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateLeadStatus();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data?.data?.lead) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lead Not Found</h2>
          <p className="text-muted-foreground mt-2 mb-6">The lead you are looking for does not exist or you do not have permission to view it.</p>
          <Link href="/leads">
            <Button>Return to Leads</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lead = data.data.lead;

  const handleStatusChange = (newStatus: string | null) => {
    if (newStatus && newStatus !== lead.status) {
      updateStatus({ id: lead.id, data: { status: newStatus as LeadStatus } });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/leads">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-4">
                <LeadAvatar firstName={lead.first_name} lastName={lead.last_name} className="h-12 w-12 text-lg" />
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  {lead.first_name} {lead.last_name}
                  <LeadStatusBadge status={lead.status} />
                </h1>
              </div>
              <p className="text-muted-foreground text-sm flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1" />
                Added on {format(new Date(lead.created_at), 'PPP')}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Lead Details & Status */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Status Update Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  Lead Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={lead.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="WON">Won</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="text-sm font-medium">{lead.first_name} {lead.last_name || '—'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                    <Phone className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="text-sm font-medium">{lead.phone_number}</p>
                  </div>
                  {lead.phone_number && (
                    <div className="flex items-center gap-1">
                      <CopyButton text={lead.phone_number} />
                      <WhatsAppButton phoneNumber={lead.phone_number} variant="outline" size="sm" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="text-sm font-medium">{lead.email || '—'}</p>
                  </div>
                  {lead.email && (
                    <div className="flex items-center gap-1">
                      <CopyButton text={lead.email} />
                      <EmailButton email={lead.email} variant="outline" size="sm" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Interactions & Tasks */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Interactions Timeline */}
            <InteractionTimeline leadId={leadId} />

            {/* Follow-up Tasks */}
            <TaskList leadId={leadId} />

          </div>
        </div>
      </div>
    </div>
  );
}
