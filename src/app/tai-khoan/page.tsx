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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/dang-nhap');
    }
  }, [user, loading, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

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