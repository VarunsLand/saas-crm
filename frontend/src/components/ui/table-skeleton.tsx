import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function TableSkeleton({ columns = 5, rows = 5 }: { columns?: number, rows?: number }) {
  return (
    <div className="w-full overflow-hidden">
      <Table>
        <TableHeader className="bg-transparent border-b border-border">
          <TableRow className="hover:bg-transparent border-none">
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i} className="h-10">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} className="border-b border-border/50 h-16">
              {Array.from({ length: columns }).map((_, j) => (
                <TableCell key={j}>
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
