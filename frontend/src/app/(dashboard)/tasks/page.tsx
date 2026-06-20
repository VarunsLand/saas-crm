'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, Task } from '@/services/task.service';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CheckCircle2, Clock, ListTodo, LayoutGrid, Calendar, Phone } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { toast } from 'sonner';

export default function TasksPage() {
  const [view, setView] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'ALL'],
    queryFn: () => taskService.getAll('ALL')
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'PENDING' | 'COMPLETED' }) => taskService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task status updated');
    }
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    
    updateStatus.mutate({ id: draggableId, status: destination.droppableId as 'PENDING' | 'COMPLETED' });
  };

  const getPriorityColor = (date: string, status: string) => {
    if (status === 'COMPLETED') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (isPast(new Date(date)) && !isToday(new Date(date))) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (isToday(new Date(date))) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
  };

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="flex flex-col min-h-full bg-[#050816] text-slate-200">
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col h-full space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-indigo-500" /> Task Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage operational workflows and follow-ups.</p>
          </div>
          
          <div className="flex bg-[#0B1220] border border-white/10 p-1 rounded-lg">
            <button 
              onClick={() => setView('KANBAN')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${view === 'KANBAN' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Board
            </button>
            <button 
              onClick={() => setView('TABLE')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${view === 'TABLE' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <ListTodo className="w-4 h-4" /> List
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse flex gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-full" /><div className="w-2 h-2 bg-indigo-500 rounded-full animation-delay-200" /></div>
          </div>
        ) : view === 'KANBAN' ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 flex gap-6 overflow-hidden min-h-[500px]">
              {[
                { id: 'PENDING', label: 'To Do', icon: Clock, color: 'text-amber-400', items: pendingTasks },
                { id: 'COMPLETED', label: 'Done', icon: CheckCircle2, color: 'text-emerald-400', items: completedTasks }
              ].map(column => (
                <div key={column.id} className="flex-1 flex flex-col bg-[#0B1220] border border-white/10 rounded-2xl overflow-hidden h-full">
                  <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <h3 className={`font-semibold tracking-wide flex items-center gap-2 ${column.color}`}>
                      <column.icon className="w-5 h-5" /> {column.label}
                    </h3>
                    <span className="text-xs font-mono bg-black/50 border border-white/5 px-2 py-0.5 rounded-full text-slate-400">
                      {column.items.length}
                    </span>
                  </div>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        className={`flex-1 p-4 overflow-y-auto space-y-4 transition-colors h-full ${snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''}`}
                      >
                        {column.items.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-[#101827] border p-4 rounded-xl shadow-lg transition-shadow group ${
                                  snapshot.isDragging ? 'border-indigo-500/50 shadow-indigo-500/20' : 'border-white/10 hover:border-white/20'
                                }`}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="font-medium text-slate-200 text-sm">Follow up</div>
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${getPriorityColor(task.due_date, task.status)}`}>
                                    {isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && task.status !== 'COMPLETED' ? 'Overdue' : isToday(new Date(task.due_date)) ? 'Today' : 'Upcoming'}
                                  </span>
                                </div>
                                
                                {task.lead && (
                                  <div className="bg-white/5 p-2 rounded-lg border border-white/5 mb-3">
                                    <div className="text-xs text-slate-400 flex justify-between items-center">
                                      <span className="font-semibold text-slate-300">{task.lead.first_name} {task.lead.last_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                                      <Phone className="w-3 h-3" /> {task.lead.phone_number || 'No phone'}
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-between items-center text-xs text-slate-500">
                                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(task.due_date), 'MMM d, yyyy')}</div>
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                                    {task.assignee?.first_name?.[0] || 'A'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className="bg-[#0B1220] border border-white/10 rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[500px]">
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-[#0B1220] sticky top-0 border-b border-white/10 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                  <tr>
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Associated Lead</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">Follow up</div>
                        <div className="text-[11px] text-slate-500">ID: {task.id.split('-')[0]}</div>
                      </td>
                      <td className="px-6 py-4">
                        {task.lead ? (
                          <div className="text-slate-300 font-medium">{task.lead.first_name} {task.lead.last_name}</div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityColor(task.due_date, task.status)}`}>
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {task.status === 'PENDING' ? (
                          <button onClick={() => updateStatus.mutate({ id: task.id, status: 'COMPLETED' })} className="text-xs px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded transition-colors cursor-pointer">
                            Mark Complete
                          </button>
                        ) : (
                          <button onClick={() => updateStatus.mutate({ id: task.id, status: 'PENDING' })} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 rounded transition-colors cursor-pointer">
                            Undo
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
                            <ListTodo className="w-8 h-8 text-slate-500" />
                          </div>
                          <h3 className="text-lg font-medium text-slate-200 mb-2">No tasks found</h3>
                          <p className="text-slate-500 max-w-sm">You have no tasks assigned to you right now. Enjoy your free time or assign some tasks to yourself.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
