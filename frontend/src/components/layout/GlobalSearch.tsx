'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/search.service';
import { Search, Users, Target, CheckSquare, FileText, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce'; // Wait, I might need to create this hook if it doesn't exist, or just use a simple state timeout. Let's just use a local timeout.

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    const handleOpenSearch = () => setIsOpen(true);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('openSearch', handleOpenSearch);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openSearch', handleOpenSearch);
    };
  }, []);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  const { data, isLoading } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: () => searchService.globalSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Search Bar */}
              <div className="flex items-center px-4 py-4 border-b border-white/10 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-6" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search leads, customers, tasks, notes... (Cmd+K)"
                  className="w-full bg-transparent border-none outline-none text-lg text-white placeholder-slate-500 pl-10 pr-10"
                />
                {isLoading && (
                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin absolute right-6" />
                )}
                {!isLoading && (
                  <div className="absolute right-6 text-xs text-slate-500 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">ESC</div>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.length < 2 && (
                  <div className="p-12 text-center text-slate-500 text-sm">
                    Type at least 2 characters to search across the CRM.
                  </div>
                )}

                {query.length >= 2 && data && (
                  <div className="p-2">
                    {/* Leads */}
                    {data.leads?.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Leads</div>
                        {data.leads.map((lead: any) => (
                          <button key={lead.id} onClick={() => handleSelect(`/leads/${lead.id}`)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-lg text-left group transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                                <Target className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-200">{lead.first_name} {lead.last_name}</div>
                                <div className="text-xs text-slate-500">{lead.email} • {lead.status}</div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Customers */}
                    {data.customers?.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customers</div>
                        {data.customers.map((cust: any) => (
                          <button key={cust.id} onClick={() => handleSelect(`/customers/${cust.id}`)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-lg text-left group transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-200">{cust.first_name} {cust.last_name}</div>
                                <div className="text-xs text-slate-500">{cust.email} • {cust.company || 'No Company'}</div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Tasks */}
                    {data.tasks?.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tasks</div>
                        {data.tasks.map((task: any) => (
                          <button key={task.id} onClick={() => handleSelect(`/tasks`)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-lg text-left group transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                                <CheckSquare className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-200">{task.title}</div>
                                <div className="text-xs text-slate-500">{task.status}</div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Notes */}
                    {data.notes?.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</div>
                        {data.notes.map((note: any) => (
                          <button key={note.id} onClick={() => handleSelect(note.customer_id ? `/customers/${note.customer_id}` : `/leads/${note.lead_id}`)} className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-lg text-left group transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-200">{note.title || 'Untitled Note'}</div>
                                <div className="text-xs text-slate-500 line-clamp-1">{note.notes}</div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty */}
                    {!isLoading && data.leads.length === 0 && data.customers.length === 0 && data.tasks.length === 0 && data.notes.length === 0 && (
                      <div className="p-12 text-center text-slate-500 text-sm">
                        No results found for "{query}".
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
