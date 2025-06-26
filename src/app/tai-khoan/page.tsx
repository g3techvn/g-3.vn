'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import Link from 'next/link';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const handleSignOut = async () => {
    try {
      const supabase = createBrowserClient();
      if (!supabase) {
        showToast('Lỗi khi khởi tạo Supabase client', 'destructive');
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) {
        showToast('Lỗi khi đăng xuất', 'destructive');
        return;
      }
      router.push('/');
    } catch (error) {
      showToast('Lỗi khi đăng xuất', 'destructive');
    }
  };

  // Show loading khi đang kiểm tra auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Đang kiểm tra thông tin tài khoản...</p>
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
            <p className="text-gray-600 mb-6">Vui lòng đăng nhập để xem thông tin tài khoản của bạn.</p>
            <div className="space-y-3">
              <Link 
                href="/dang-nhap?redirect=/tai-khoan"
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

  // Nếu đã đăng nhập, hiển thị thông tin tài khoản
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Tài khoản của tôi</h1>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Đăng xuất
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Thông tin cá nhân</h2>
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Họ tên</dt>
                      <dd className="text-sm text-gray-900">{user.fullName}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Quản lý tài khoản</h2>
                <div className="mt-3 space-y-4">
                  <Link
                    href="/tai-khoan/thong-tin"
                    className="block text-sm text-red-600 hover:text-red-500"
                  >
                    Cập nhật thông tin cá nhân
                  </Link>
                  <Link
                    href="/tai-khoan/don-hang"
                    className="block text-sm text-red-600 hover:text-red-500"
                  >
                    Lịch sử đơn hàng
                  </Link>
                  <Link
                    href="/tai-khoan/diem-thuong"
                    className="block text-sm text-red-600 hover:text-red-500"
                  >
                    Điểm thưởng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 