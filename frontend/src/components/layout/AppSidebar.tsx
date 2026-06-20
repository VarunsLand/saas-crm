'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Target,
  X,
  Hexagon,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pipeline', href: '/pipeline', icon: Target },
  { name: 'Tasks', href: '/tasks', icon: CheckCircle2 },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Revenue', href: '/revenue', icon: Hexagon },
  { name: 'Expenses', href: '/expenses', icon: Hexagon },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-white transition-opacity hover:opacity-80" onClick={onClose}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Hexagon className="text-white w-5 h-5" fill="currentColor" />
            </div>
            SaaS CRM
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/20" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
