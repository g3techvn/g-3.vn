'use client';

import { useState, useEffect } from 'react';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminOrdersPage() {
  // Bỏ kiểm tra auth, chỉ render luôn OrdersManager
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-2">Xem và quản lý tất cả đơn hàng trong hệ thống</p>
        </div>
        <OrdersManager />
      </div>
    </div>
  );
} 