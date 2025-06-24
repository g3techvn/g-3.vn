'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/useToast";

interface LoginFormProps {
  redirectTo: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const { user, loading: isLoading, signIn, signUp } = useAuth();
  const router = useRouter();
  const [isSignInMode, setIsSignInMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
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
          <div className="text-2xl font-bold text-red-600">G3 Tech</div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignInMode ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignInMode ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <button
            onClick={() => setIsSignInMode(!isSignInMode)}
            className="font-medium text-red-600 hover:text-red-500"
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
                className="w-full flex justify-center py-2 px-4"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  isSignInMode ? 'Đăng nhập' : 'Đăng ký'
                )}
              </Button>
            </div>
          </form>

          {isSignInMode && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Quên mật khẩu?{' '}
                    <Link href="/quen-mat-khau" className="font-medium text-red-600 hover:text-red-500">
                      Lấy lại mật khẩu
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 