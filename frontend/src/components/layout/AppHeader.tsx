'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, Loader2, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { currentUser, isUserLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-xl px-4 sm:px-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5 text-white" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <button 
          onClick={() => window.dispatchEvent(new Event('openSearch'))}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] border border-white/10 rounded-md text-sm text-slate-400 transition-colors group"
        >
          <Search className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
          <span className="w-48 text-left">Search CRM...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {isUserLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 border hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center">
              <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                {currentUser.first_name[0]}{currentUser.last_name[0]}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.first_name} {currentUser.last_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-default focus:bg-transparent">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {currentUser.role}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}
