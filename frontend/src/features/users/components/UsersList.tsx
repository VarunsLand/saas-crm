'use client';

import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { User, UserRole } from '../types';
import { LeadAvatar } from '@/features/leads/components/LeadAvatar';
import { CopyButton } from '@/components/ui/copy-button';
import { format } from 'date-fns';
import { AlertCircle, Search, ShieldCheck, Users as UsersIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserDetailsDialog } from './UserDetailsDialog';


export function UsersList() {
  const { data, isLoading, isError, refetch } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

  const users = data?.data?.users || [];

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 mt-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:max-w-[180px]">
          <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val as UserRole | 'ALL')}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admins Only</SelectItem>
              <SelectItem value="STAFF">Staff Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-0">
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-red-500">
              <AlertCircle className="w-8 h-8" />
              <p>Failed to load users.</p>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-4">
                <UsersIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No users found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
                  <tr className="border-none">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Created</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredUsers.map((user: User) => (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800/50 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <LeadAvatar firstName={user.first_name} lastName={user.last_name} className="h-9 w-9" />
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-slate-100">{user.first_name} {user.last_name}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                              <CopyButton text={user.email} className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {user.role === 'ADMIN' ? (
                          <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            Admin
                          </div>
                        ) : (
                          <div className="flex items-center text-slate-600 dark:text-slate-400 font-medium text-xs">
                            Staff
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={user.status === 'INACTIVE' ? 'secondary' : 'default'} className="font-normal text-[10px] uppercase tracking-wider">
                          {user.status || 'ACTIVE'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle hidden md:table-cell text-muted-foreground">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <UserDetailsDialog user={user}>
                          <Button variant="ghost" size="sm">Manage</Button>
                        </UserDetailsDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
