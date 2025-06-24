'use client';

import React from 'react';
import { Roboto_Flex as RobotoFlex } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { useState, useRef } from 'react';
import PageViewTracker from '@/components/PageViewTracker';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/Toaster';

const roboto = RobotoFlex({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-roboto-flex',
  display: 'swap',
});

// Create a client
const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 phút
    },
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient(queryClientOptions);
  }

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`${roboto.variable} font-sans`}>
      <QueryClientProvider client={queryClientRef.current}>
        <AuthProvider>
          <ThemeProvider>
            {mounted && (
              <Suspense fallback={null}>
                <PageViewTracker />
              </Suspense>
            )}
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
        {/* ReactQueryDevtools chỉ hiển thị trong môi trường development */}
        {process.env.NODE_ENV === 'development' && mounted && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </div>
  );
} 