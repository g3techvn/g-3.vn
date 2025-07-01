'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/Toaster';
import { Roboto } from 'next/font/google';
import { useRef } from 'react';
import { AuthProvider } from '@/features/auth';
import { DeviceProvider } from '@/components/common/DeviceProvider';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const queryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient(queryClientOptions);
  }

  return (
    <div className={`${roboto.variable} font-sans`}>
      <QueryClientProvider client={queryClientRef.current}>
        <AuthProvider>
          <DeviceProvider>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
          </DeviceProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
} 