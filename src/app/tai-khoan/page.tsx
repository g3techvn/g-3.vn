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
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';

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
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserClient();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || authLoading) return;
    loadAccountData();
  }, [user, authLoading]);

  const loadAccountData = async () => {
    try {
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        setError(error.message);
      } else {
        showToast('Đăng nhập thành công', 'default');
        router.push('/');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Có lỗi xảy ra khi đăng nhập');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/tai-khoan`
        }
      });
      if (error) {
        setError(error.message);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      setError('Có lỗi xảy ra khi đăng nhập với Google');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/tai-khoan`
        }
      });
      if (error) {
        setError(error.message);
      }
    } catch (error) {
      console.error('Facebook login failed:', error);
      setError('Có lỗi xảy ra khi đăng nhập với Facebook');
    }
  };

  if (!user) {
    return (
      <>
        <MobileHomeHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md p-6">
            <div className="text-center mb-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Đăng nhập</h2>
              <p className="text-gray-600">Vui lòng đăng nhập để truy cập tài khoản của bạn</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <a href="#" className="text-sm text-red-600 hover:text-red-800">
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-50"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Hoặc đăng nhập với
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Chưa có tài khoản?{' '}
                  <Link href="/dang-ky" className="text-red-600 hover:text-red-800 font-medium">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileHomeHeader />
      <div className="min-h-screen pt-12">
        <div className="border-b">
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Tài khoản của tôi</h1>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center px-4 py-3 border-b bg-gray-50">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-gray-200">
              <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-base font-semibold text-gray-900">
                {profile?.full_name || user.email?.split('@')[0] || 'Bạn'}
              </div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Đăng xuất
            </Button>
          </div>
        </div>

        <div className="p-4">
          {/* Main Content */}
          <div className="min-h-screen pt-28 md:pt-0">
            {/* Desktop Header */}
            <div className="hidden md:block border-b">
              <div className="container mx-auto py-6">
                <div className="flex items-center justify-between">
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
                </div>
                
                {profile?.created_at && (
                  <div className="mt-4">
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Thành viên từ {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Cards */}
            <div className="container mx-auto py-8 px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 