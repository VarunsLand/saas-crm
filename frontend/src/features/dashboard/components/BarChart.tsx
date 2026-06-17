'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BarSegment {
  label: string;
  value: number;
  color: string;
  hoverColor: string;
}

interface BarChartProps {
  segments: BarSegment[];
  title: string;
  className?: string;
}

export function BarChart({ segments, title, className }: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...segments.map((s) => s.value), 1);

  if (segments.every((s) => s.value === 0)) {
    return (
      <Card className={cn("bg-gradient-to-b from-white to-slate-50/50", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-800">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-sm text-slate-400">No lead data available</p>
        </CardContent>
      </Card>
    );
  }

  // Y-axis scale: generate 4 nice tick marks
  const rawStep = maxValue / 4;
  const step = rawStep <= 1 ? 1 : Math.ceil(rawStep);
  const scaledMax = step * 4;
  const ticks = [0, step, step * 2, step * 3, step * 4];

  return (
    <Card className={cn("bg-gradient-to-b from-white to-slate-50/50", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Y-axis grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ bottom: '32px', top: '0' }}>
            {ticks.reverse().map((tick) => (
              <div key={`tick-${tick}`} className="flex items-center gap-2 w-full">
                <span className="text-xs text-slate-400 tabular-nums w-6 text-right shrink-0">{tick}</span>
                <div className="flex-1 border-b border-dashed border-slate-100" />
              </div>
            ))}
          </div>

          {/* Bars container */}
          <div className="flex items-end justify-around gap-3 sm:gap-6 pt-4 pb-2 pl-9" style={{ height: '220px' }}>
            {segments.map((segment, i) => {
              const heightPercent = scaledMax > 0 ? (segment.value / scaledMax) * 100 : 0;
              const isHovered = hoveredIndex === i;
              return (
                <div
                  key={segment.label}
                  className="flex flex-col items-center gap-2 flex-1 h-full justify-end"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip */}
                  <div
                    className={cn(
                      "text-xs font-semibold tabular-nums transition-all duration-200",
                      isHovered ? "opacity-100 text-slate-900" : "opacity-0"
                    )}
                  >
                    {segment.value}
                  </div>
                  
                  {/* Bar */}
                  <div
                    className="w-full max-w-[56px] rounded-t-xl transition-all duration-500 ease-out cursor-pointer relative group"
                    style={{
                      height: `${Math.max(heightPercent, 2)}%`,
                      backgroundColor: isHovered ? segment.hoverColor : segment.color,
                      boxShadow: isHovered
                        ? `0 8px 24px -4px ${segment.color}40`
                        : 'none',
                      transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                      transformOrigin: 'bottom',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-around pl-9 pt-2 border-t border-slate-100">
            {segments.map((segment, i) => (
              <div
                key={segment.label}
                className={cn(
                  "flex flex-col items-center flex-1 transition-colors cursor-pointer",
                  hoveredIndex === i ? "text-slate-900" : "text-slate-500"
                )}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span className="text-xs font-medium truncate max-w-[72px]">{segment.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
