'use client';

import { UsersList } from '@/features/users/components/UsersList';
import { CreateUserDialog } from '@/features/users/components/CreateUserDialog';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UsersPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  // Users page specific protection (ADMIN only)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="flex flex-col min-h-full bg-[#050816] text-slate-200">
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Users Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your workspace staff and administrator roles.
            </p>
          </div>
          <CreateUserDialog />
        </div>

        {/* Users Table */}
        <section className="bg-[#0B1220] border border-white/10 shadow-2xl rounded-xl overflow-hidden">
          <UsersList />
        </section>
      </div>
    </div>
  );
}
