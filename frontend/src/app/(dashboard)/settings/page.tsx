'use client';

import { useSettings } from '@/features/settings/hooks/useSettings';
import { WorkspaceProfileSettings } from '@/features/settings/components/WorkspaceProfileSettings';
import { LeadSourcesSettings } from '@/features/settings/components/LeadSourcesSettings';

export default function SettingsPage() {
  const { 
    profile, 
    isProfileLoading, 
    updateProfile, 
    isUpdatingProfile,
    leadSources,
    isLeadSourcesLoading,
    createLeadSource,
    isCreatingLeadSource
  } = useSettings();

  return (
    <div className="flex flex-col min-h-full bg-[#050816] text-slate-200">
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Workspace Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your workspace configuration and preferences.
          </p>
        </div>

        <div className="bg-[#0B1220] border border-white/10 shadow-2xl rounded-xl overflow-hidden p-6">
          <WorkspaceProfileSettings 
            profile={profile}
            isLoading={isProfileLoading}
            onUpdate={updateProfile}
            isUpdating={isUpdatingProfile}
          />
        </div>

        <div className="bg-[#0B1220] border border-white/10 shadow-2xl rounded-xl overflow-hidden p-6">
          <LeadSourcesSettings
            sources={leadSources}
            isLoading={isLeadSourcesLoading}
            onCreate={createLeadSource}
            isCreating={isCreatingLeadSource}
          />
        </div>
      </div>
    </div>
  );
}
