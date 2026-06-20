'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { QuickActionFAB } from '@/components/layout/QuickActionFAB';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isUserLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isUserLoading && !currentUser) {
      router.push('/login');
    }
  }, [mounted, isUserLoading, currentUser, router]);

  // Global full-page loading state
  if (!mounted || isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center w-12 h-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 dark:border-slate-800" />
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of unauthenticated content
  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050816]">
      <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-transparent relative">
          {children}
        </main>
        <GlobalSearch />
        <QuickActionFAB />
      </div>
    </div>
  );
}
