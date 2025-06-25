'use client';

import { useState, useEffect } from 'react';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { useAuth } from '@/features/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading khi đang kiểm tra auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h1>
            <p className="text-gray-600 mb-6">Bạn cần đăng nhập với tài khoản quản trị viên để truy cập trang này.</p>
            <div className="space-y-3">
              <Link 
                href="/dang-nhap?redirect=/don-hang"
                className="block w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kiểm tra role admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
            <p className="text-gray-600 mb-2">Bạn không có quyền để truy cập trang này.</p>
            <p className="text-sm text-gray-500 mb-6">Trang này chỉ dành cho quản trị viên.</p>
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Quay lại
              </button>
              <Link 
                href="/"
                className="block w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu là admin, hiển thị trang đơn hàng
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