'use client';

import { LeadList } from '@/features/leads/components/LeadList';
import { CreateLeadDialog } from '@/features/leads/components/CreateLeadDialog';
import { ImportLeadsDialog } from '@/features/leads/components/ImportLeadsDialog';

export default function LeadsPage() {
  return (
    <div className="flex flex-col min-h-full bg-[#050816] text-slate-200">
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Leads Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View, search, and manage your sales pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ImportLeadsDialog />
            <CreateLeadDialog />
          </div>
        </div>

        {/* Lead List Table */}
        <section className="bg-[#0B1220] border border-white/10 shadow-2xl rounded-xl overflow-hidden">
          <LeadList />
        </section>
      </div>
    </div>
  );
}
