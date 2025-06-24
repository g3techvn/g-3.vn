'use client';

import { useState, useEffect } from 'react';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push('/dang-nhap');
      return;
    }

    if (user) {
      setIsLoading(false);
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Chưa đăng nhập</h1>
          <p className="text-gray-600 mt-2">Vui lòng đăng nhập để xem đơn hàng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
          <p className="text-gray-600 mt-2">Xem và quản lý đơn hàng của bạn</p>
        </div>
        
        <OrdersManager />
      </div>
    </div>
  );
} 