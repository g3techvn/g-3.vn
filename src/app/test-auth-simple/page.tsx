'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import AuthModals from '@/components/features/auth/AuthModals';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { createBrowserClient } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';

export default function TestAuthPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

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
      showToast('Đăng xuất thành công', 'default');
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-2xl font-bold">
          {user ? `Xin chào, ${user.email}` : 'Vui lòng đăng nhập'}
        </h1>

        {user ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn đã đăng nhập thành công!
            </p>
            <Button
              onClick={handleSignOut}
              className="bg-red-600 text-white"
            >
              Đăng xuất
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Đăng nhập để trải nghiệm các tính năng của website.
            </p>
            <Button
              onClick={() => {
                window.location.href = '/dang-nhap';
              }}
              className="bg-red-600 text-white"
            >
              Đăng nhập
            </Button>
          </div>
        )}
      </div>

      {/* Auth Modals */}
      <AuthModals />
    </div>
  );
} 