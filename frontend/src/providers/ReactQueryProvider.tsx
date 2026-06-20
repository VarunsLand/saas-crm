'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes (data remains fresh)
            gcTime: 10 * 60 * 1000,   // 10 minutes (keep in garbage collection cache)
            refetchOnWindowFocus: false,
            retry: 1, // Only retry once to avoid freezing the UI on bad networks
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
