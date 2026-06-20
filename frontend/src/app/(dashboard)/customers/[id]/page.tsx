'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';
import { motion } from 'framer-motion';
import { Phone, Mail, Building, Clock, IndianRupee, Activity, FileText, CheckSquare, Target } from 'lucide-react';
import { format } from 'date-fns';

interface InteractionData { id: string; created_at: string; type: string; notes?: string; }
interface TaskData { id: string; completed_at: string; status: string; title: string; assignee?: { first_name?: string; last_name?: string }; due_date: string; }
interface RevenueData { id: string; created_at: string; amount: number; description: string; date: string; }
interface TimelineEvent {
  id: string;
  type: string;
  date: Date;
  data: Partial<InteractionData & TaskData & RevenueData>;
}

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getById(id)
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto w-full animate-pulse space-y-6">
        <div className="h-40 bg-white/5 rounded-2xl border border-white/10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white/5 rounded-2xl border border-white/10 lg:col-span-2" />
          <div className="h-96 bg-white/5 rounded-2xl border border-white/10" />
        </div>
      </div>
    );
  }

  if (error || !data?.customer) {
    return <div className="p-8 text-center text-red-400">Failed to load customer profile.</div>;
  }

  const { customer, sourceLead } = data;

  const totalRevenue = customer.revenue_entries?.reduce((acc: number, entry: { amount: number }) => acc + entry.amount, 0) || 0;

  // Aggregate timeline events
  const timelineEvents: TimelineEvent[] = [];
  
  if (sourceLead) {
    timelineEvents.push({ id: 'lead_created', type: 'LEAD_CREATED', date: new Date(sourceLead.created_at), data: sourceLead });
    
    if (sourceLead.interactions) {
      sourceLead.interactions.forEach((int: InteractionData) => {
        timelineEvents.push({ id: `lead_int_${int.id}`, type: 'INTERACTION', date: new Date(int.created_at), data: int });
      });
    }
    if (sourceLead.follow_up_tasks) {
      sourceLead.follow_up_tasks.forEach((task: TaskData) => {
        if (task.status === 'COMPLETED' && task.completed_at) {
          timelineEvents.push({ id: `lead_task_${task.id}`, type: 'TASK_COMPLETED', date: new Date(task.completed_at), data: task });
        }
      });
    }
  }

  timelineEvents.push({ id: 'customer_created', type: 'CUSTOMER_CREATED', date: new Date(customer.created_at), data: customer });

  if (customer.interactions) {
    customer.interactions.forEach((int: InteractionData) => {
      timelineEvents.push({ id: `cust_int_${int.id}`, type: 'INTERACTION', date: new Date(int.created_at), data: int });
    });
  }
  
  if (customer.tasks) {
    customer.tasks.forEach((task: TaskData) => {
      if (task.status === 'COMPLETED' && task.completed_at) {
        timelineEvents.push({ id: `cust_task_${task.id}`, type: 'TASK_COMPLETED', date: new Date(task.completed_at), data: task });
      }
    });
  }

  if (customer.revenue_entries) {
    customer.revenue_entries.forEach((rev: RevenueData) => {
      timelineEvents.push({ id: `rev_${rev.id}`, type: 'REVENUE', date: new Date(rev.created_at), data: rev });
    });
  }

  timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex-1 w-full bg-[#050816] text-slate-200">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
        
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0B1220] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
                {customer.first_name[0]}{customer.last_name?.[0] || ''}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{customer.first_name} {customer.last_name}</h1>
                {customer.company && (
                  <div className="flex items-center gap-1.5 text-slate-400 mt-1 font-medium">
                    <Building className="w-4 h-4" /> {customer.company}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {customer.phone_number && (
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5 text-sm font-medium text-slate-300">
                  <Phone className="w-4 h-4 text-indigo-400" /> {customer.phone_number}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/5 text-sm font-medium text-slate-300">
                  <Mail className="w-4 h-4 text-indigo-400" /> {customer.email}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Revenue History */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2"><IndianRupee className="w-5 h-5 text-emerald-400" /> Revenue History</h2>
                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Lifetime Value</div>
                  <div className="text-2xl font-mono text-emerald-400">₹{totalRevenue.toLocaleString()}</div>
                </div>
              </div>

              {customer.revenue_entries?.length > 0 ? (
                <div className="space-y-3">
                  {customer.revenue_entries.map((entry: RevenueData) => (
                    <div key={entry.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.07] transition-colors">
                      <div>
                        <div className="font-medium text-slate-200">{entry.description}</div>
                        <div className="text-xs text-slate-500 mt-1">{format(new Date(entry.date), 'MMM d, yyyy')}</div>
                      </div>
                      <div className="text-emerald-400 font-mono font-medium">+₹{entry.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">No revenue recorded yet.</div>
              )}
            </motion.div>

            {/* Global Timeline feed */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6"><Activity className="w-5 h-5 text-indigo-400" /> Customer Timeline</h2>
              
              {timelineEvents.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/20 before:via-indigo-500/20 before:to-transparent">
                  {timelineEvents.map((event: TimelineEvent) => {
                    let Icon = FileText;
                    let colorClass = 'text-indigo-400';
                    let bgClass = 'group-[.is-active]:bg-indigo-500/20';
                    let title = '';
                    let desc = '';

                    if (event.type === 'LEAD_CREATED') {
                      Icon = Target; colorClass = 'text-sky-400'; bgClass = 'group-[.is-active]:bg-sky-500/20';
                      title = 'Lead Created';
                      desc = 'Initial contact made in the CRM.';
                    } else if (event.type === 'CUSTOMER_CREATED') {
                      Icon = Building; colorClass = 'text-emerald-400'; bgClass = 'group-[.is-active]:bg-emerald-500/20';
                      title = 'Converted to Customer';
                      desc = 'Lead was won and became a customer.';
                    } else if (event.type === 'INTERACTION') {
                      Icon = FileText; colorClass = 'text-indigo-400'; bgClass = 'group-[.is-active]:bg-indigo-500/20';
                      title = event.data.type === 'NOTE' ? 'Note Added' : `Interaction: ${event.data.type}`;
                      desc = event.data.notes || 'No description provided.';
                    } else if (event.type === 'TASK_COMPLETED') {
                      Icon = CheckSquare; colorClass = 'text-amber-400'; bgClass = 'group-[.is-active]:bg-amber-500/20';
                      title = `Task Completed: ${event.data.title}`;
                      desc = `Completed by ${event.data.assignee?.first_name || 'User'}`;
                    } else if (event.type === 'REVENUE') {
                      Icon = IndianRupee; colorClass = 'text-emerald-400'; bgClass = 'group-[.is-active]:bg-emerald-500/20';
                      title = `Revenue Added: ₹${event.data.amount?.toLocaleString() ?? '0'}`;
                      desc = event.data.description || '';
                    }

                    return (
                      <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-[#101827] ${bgClass} ${colorClass} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 border border-white/5 p-4 rounded-xl shadow">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-slate-200 text-sm">{title}</div>
                            <time className="font-mono text-[10px] text-slate-500">{format(event.date, 'MMM d, yyyy h:mm a')}</time>
                          </div>
                          <div className="text-sm text-slate-400 mt-2">{desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">No timeline events found.</div>
              )}
            </motion.div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Origin Info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><Target className="w-5 h-5 text-rose-400" /> Origin</h2>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Customer Since</div>
                  <div className="text-sm text-slate-200 font-medium">{format(new Date(customer.created_at), 'MMMM d, yyyy')}</div>
                </div>
                {sourceLead && (
                  <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Converted From Lead</div>
                    <div className="text-sm text-slate-200 font-medium">{format(new Date(sourceLead.created_at), 'MMMM d, yyyy')}</div>
                    {sourceLead.source && (
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                        Source: {sourceLead.source.name}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tasks */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#0B1220] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><CheckSquare className="w-5 h-5 text-amber-400" /> Tasks</h2>
              {sourceLead?.follow_up_tasks?.length > 0 ? (
                <div className="space-y-3">
                  {sourceLead.follow_up_tasks.map((task: TaskData) => (
                    <div key={task.id} className="bg-white/5 border border-white/5 rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-slate-200">Follow up required</div>
                        <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> Due {format(new Date(task.due_date), 'MMM d')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">No active tasks.</div>
              )}
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}
