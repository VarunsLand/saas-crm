'use client';
import { PipelineBoard } from '@/features/pipeline/components/PipelineBoard';

export default function PipelinePage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#050816] text-slate-200">
      <div className="flex-1 overflow-hidden p-4 md:p-8 max-w-[1800px] mx-auto w-full flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Sales Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and convert leads across the sales journey.</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <PipelineBoard />
        </div>
      </div>
    </div>
  );
}
