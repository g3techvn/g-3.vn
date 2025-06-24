'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from "@/hooks/useToast";

function LoginContent() {
  const { user, loading: isLoading, signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/gio-hang';
  
  const [isSignInMode, setIsSignInMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const supabase = createBrowserClient();
  const { showToast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push(redirectTo);
    }
  }, [user, isLoading, redirectTo, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        showToast(error.message, 'destructive');
        return;
      }

      showToast('Đăng nhập thành công!', 'default');
      router.push(redirectTo);
    } catch (error: any) {
      showToast('Có lỗi xảy ra khi đăng nhập', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'destructive');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', 'destructive');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);

      if (error) {
        showToast(error.message, 'destructive');
        return;
      }

      showToast('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.', 'default');
      setIsSignInMode(true);
    } catch (error: any) {
      showToast('Có lỗi xảy ra khi đăng ký', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`
        }
      });

      if (error) {
        showToast(error.message, 'destructive');
      }
    } catch (error: any) {
      showToast('Có lỗi xảy ra khi đăng nhập với Google', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <div className="text-2xl font-bold text-blue-600">G3 Tech</div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignInMode ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignInMode ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <button
            onClick={() => setIsSignInMode(!isSignInMode)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isSignInMode ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={isSignInMode ? handleSignIn : handleSignUp} className="space-y-6">
            {!isSignInMode && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <div className="mt-1">
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={!isSignInMode}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Địa chỉ email
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Nhập địa chỉ email của bạn"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignInMode ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isSignInMode ? "Nhập mật khẩu" : "Tạo mật khẩu (tối thiểu 6 ký tự)"}
                />
              </div>
            </div>

            {!isSignInMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <div className="mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required={!isSignInMode}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Đang xử lý...' : (isSignInMode ? 'Đăng nhập' : 'Đăng ký')}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập với Google
              </Button>
            </div>
          </div>

          {isSignInMode && (
            <div className="mt-6 text-center">
              <Link href="/quen-mat-khau" className="text-sm text-blue-600 hover:text-blue-500">
                Quên mật khẩu?
              </Link>
            </div>
          )}
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-500">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 