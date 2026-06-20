'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { pipelineService } from '../services/pipeline.service';
import { Lead, LeadStatus } from '@/features/leads/types';
import { toast } from 'sonner';
import { Phone, Mail } from 'lucide-react';

const COLUMNS: { id: LeadStatus; label: string }[] = [
  { id: 'NEW', label: 'New' },
  { id: 'CONTACTED', label: 'Contacted' },
  { id: 'QUALIFIED', label: 'Qualified' },
  { id: 'PROPOSAL', label: 'Proposal' },
  { id: 'NEGOTIATION', label: 'Negotiation' },
  { id: 'WON', label: 'Won' },
  { id: 'LOST', label: 'Lost' }
];

export function PipelineBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await pipelineService.getLeads();
      setLeads(data);
    } catch (error) {
      toast.error('Failed to load leads pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const leadToMove = leads.find(l => l.id === draggableId);
    if (!leadToMove) return;

    const newStage = destination.droppableId as LeadStatus;

    // Optimistic Update
    const originalLeads = [...leads];
    setLeads(prev => prev.map(l => l.id === draggableId ? { ...l, status: newStage } : l));

    try {
      await pipelineService.updateStage(draggableId, newStage);
      toast.success(`Moved to ${COLUMNS.find(c => c.id === newStage)?.label}`);
    } catch (error) {
      setLeads(originalLeads);
      toast.error('Failed to update stage');
    }
  };

  const convertLead = async (leadId: string) => {
    try {
      await pipelineService.convertToCustomer(leadId);
      toast.success('Successfully converted Lead to Customer!');
      loadLeads();
    } catch {
      toast.error('Failed to convert lead');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-mono">Loading pipeline...</div>;

  // KPI calculations
  const totalLeads = leads.length;
  const qualified = leads.filter(l => ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'].includes(l.status)).length;
  const won = leads.filter(l => l.status === 'WON').length;
  const lost = leads.filter(l => l.status === 'LOST').length;
  const conversionRate = totalLeads > 0 ? Math.round((won / (totalLeads - lost || 1)) * 100) : 0;

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Analytics Row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Pipeline', value: totalLeads },
          { label: 'Active Deals', value: qualified },
          { label: 'Won Deals', value: won, color: 'text-emerald-400' },
          { label: 'Lost Deals', value: lost, color: 'text-red-400' },
          { label: 'Win Rate', value: `${conversionRate}%`, color: 'text-indigo-400' }
        ].map((kpi, i) => (
          <div key={i} className="bg-[#0B1220] border border-white/10 rounded-xl p-4 shadow-xl flex flex-col justify-center">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{kpi.label}</span>
            <span className={`text-2xl font-semibold mt-1 ${kpi.color || 'text-white'}`}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start h-full scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {COLUMNS.map(column => {
            const columnLeads = leads.filter(l => l.status === column.id);
            return (
              <div key={column.id} className="min-w-[320px] w-[320px] max-w-[320px] bg-[#0B1220] border border-white/5 rounded-2xl flex flex-col h-full flex-shrink-0">
                
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02] rounded-t-2xl">
                  <h3 className="font-semibold tracking-wide text-slate-200">{column.label}</h3>
                  <span className="bg-black/50 border border-white/10 px-2 py-0.5 rounded-full text-xs font-mono text-slate-400">
                    {columnLeads.length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors rounded-b-2xl ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
                    >
                      {columnLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
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
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-white text-sm">{lead.first_name} {lead.last_name}</h4>
                              </div>
                              
                              <div className="space-y-1.5 text-xs text-slate-400">
                                {lead.phone_number && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500"/> {lead.phone_number}</div>}
                                {lead.email && <div className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 text-slate-500"/> {lead.email}</div>}
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] uppercase font-semibold text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </span>
                                {column.id === 'WON' && !lead.converted_to_customer_id && (
                                  <button onClick={() => convertLead(lead.id)} className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 px-2 py-1 rounded-md border border-emerald-400/20 transition-colors">
                                    Convert to Customer
                                  </button>
                                )}
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
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
