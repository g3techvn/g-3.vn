'use client';

import React from 'react';
import { Roboto_Flex as RobotoFlex } from 'next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { DomainProvider } from '@/context/domain-context';
import { CartProvider } from '@/features/cart/CartProvider';
import { useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import PageViewTracker from '@/components/PageViewTracker';
import { Suspense } from 'react';

const roboto = RobotoFlex({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-roboto-flex',
  display: 'swap',
});

export default function Providers({ children }: { children: React.ReactNode }) {
  // Tạo QueryClient mới cho mỗi session
  // để tránh data sharing giữa các users và requests
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 phút
      },
    },
  }));

  return (
    <div className={`${roboto.variable} font-sans`}>
      <QueryClientProvider client={queryClient}>
        <DomainProvider>
          <AuthProvider>
            <CartProvider>
              <AntdRegistry>
                {/* Track page views */}
                <Suspense fallback={null}>
                  <PageViewTracker />
                </Suspense>
                {children}
              </AntdRegistry>
            </CartProvider>
          </AuthProvider>
        </DomainProvider>
        {/* ReactQueryDevtools chỉ hiển thị trong môi trường development */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </div>
  );
} 