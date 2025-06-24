'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from "@/hooks/useToast";

interface UserProfile {
  id?: string;
  user_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  created_at?: string;
}

interface OrderSummary {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_spent: number;
}

export default function AccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user || authLoading) return;
    loadAccountData();
  }, [user, authLoading]);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      
      const [profileRes, ordersRes] = await Promise.all([
        fetch('/api/user'),
        fetch(`/api/orders?user_id=${user?.id}`)
      ]);

      if (profileRes.ok) {
        const { profile: userProfile } = await profileRes.json();
        setProfile(userProfile);
      }

      if (ordersRes.ok) {
        const { orders } = await ordersRes.json();
        const summary = {
          total_orders: orders.length,
          pending_orders: orders.filter((o: any) => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
          completed_orders: orders.filter((o: any) => o.status === 'delivered').length,
          total_spent: orders.reduce((sum: number, order: any) => sum + order.total_price, 0)
        };
        setOrderSummary(summary);
      }

    } catch (error) {
      console.error('Error loading account data:', error);
      showToast('Lỗi khi tải thông tin tài khoản', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        showToast('Lỗi khi đăng xuất', 'destructive');
        return;
      }
      
      showToast('Đăng xuất thành công', 'default');
      router.push('/');
    } catch (error) {
      showToast('Có lỗi xảy ra khi đăng xuất', 'destructive');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 text-center">
        <div className="py-16">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để truy cập tài khoản của mình.</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Xin chào, {profile?.full_name || user.email?.split('@')[0] || 'Bạn'}!
              </h1>
              <p className="text-gray-600">Chào mừng bạn đến với tài khoản G3 Tech</p>
            </div>
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </Button>
        </div>
        
        {profile?.created_at && (
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thành viên từ {new Date(profile.created_at).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {orderSummary?.total_orders || 0}
          </div>
          <div className="text-sm text-gray-600">Tổng đơn hàng</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {orderSummary?.pending_orders || 0}
          </div>
          <div className="text-sm text-gray-600">Đang xử lý</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {orderSummary?.completed_orders || 0}
          </div>
          <div className="text-sm text-gray-600">Đã hoàn thành</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {orderSummary?.total_spent?.toLocaleString('vi-VN') || '0'}₫
          </div>
          <div className="text-sm text-gray-600">Tổng chi tiêu</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/tai-khoan/thong-tin">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Thông tin tài khoản</h3>
                <p className="text-sm text-gray-600">Quản lý thông tin cá nhân</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/tai-khoan/don-hang">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Đơn hàng của tôi</h3>
                <p className="text-sm text-gray-600">Theo dõi trạng thái đơn hàng</p>
              </div>
            </div>
            {orderSummary && orderSummary.pending_orders > 0 && (
              <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
                {orderSummary.pending_orders} đang xử lý
              </Badge>
            )}
          </Card>
        </Link>

        <Link href="/uu-dai">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ưu đãi & Voucher</h3>
                <p className="text-sm text-gray-600">Khám phá các ưu đãi</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Thông tin tài khoản</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Họ tên:</span>
              <span className="font-medium">{profile?.full_name || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số điện thoại:</span>
              <span className="font-medium">{profile?.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Địa chỉ:</span>
              <span className="font-medium text-right">{profile?.address || 'Chưa cập nhật'}</span>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/tai-khoan/thong-tin"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Cập nhật thông tin →
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
          {orderSummary && orderSummary.total_orders > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Bạn đã có {orderSummary.total_orders} đơn hàng</p>
                  <p className="text-sm text-gray-600">
                    {orderSummary.completed_orders} đã hoàn thành, {orderSummary.pending_orders} đang xử lý
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Link 
                  href="/tai-khoan/don-hang"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Xem tất cả đơn hàng →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-600 mb-4">Chưa có đơn hàng nào</p>
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Bắt đầu mua sắm
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 