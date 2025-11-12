'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { ToastProvider } from '@/hooks/useToast';
import { ToastRenderer } from '@/components/ui/toast-renderer';

/**
 * Check if MSW should be enabled
 *
 * MSW is enabled when:
 * 1. We're in development mode
 * 2. NEXT_PUBLIC_MSW_ENABLED is not explicitly set to 'false'
 */
const shouldEnableMSW = () => {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_MSW_ENABLED !== 'false'
  );
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 2,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  // Initialize MSW in development mode
  const [mswReady, setMswReady] = useState(!shouldEnableMSW());

  useEffect(() => {
    if (shouldEnableMSW()) {
      // Dynamic import to avoid bundling MSW in production
      import('@/mocks/browser')
        .then(({ startMockWorker }) => startMockWorker())
        .then(() => setMswReady(true))
        .catch((error) => {
          console.error('[MSW] Failed to initialize:', error);
          // Continue without MSW if initialization fails
          setMswReady(true);
        });
    }
  }, []);

  // Don't render children until MSW is ready in development
  // This prevents race conditions where API calls happen before MSW starts
  if (!mswReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
        <ToastRenderer />
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  );
}
