'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import AuthModals from '@/components/features/auth/AuthModals';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function TestAuthSimplePage() {
  const { user, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Test Tính Năng Authentication PC
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Status Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Trạng Thái Người Dùng</h2>
            {user ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✅ Đã đăng nhập</p>
                </div>
                <div className="space-y-2">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Họ tên:</strong> {user.fullName}</p>
                  <p><strong>Số điện thoại:</strong> {user.phone || 'Chưa có'}</p>
                  <p><strong>Vai trò:</strong> {user.role}</p>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">⚠️ Chưa đăng nhập</p>
                </div>
                <p className="text-gray-600">
                  Vui lòng đăng nhập hoặc đăng ký tài khoản mới.
                </p>
              </div>
            )}
          </Card>

          {/* Test Controls Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Kiểm Tra Chức Năng</h2>
            <div className="space-y-3">
              <Button
                onClick={() => setIsLoginOpen(true)}
                className="w-full"
              >
                Mở Modal Đăng Nhập
              </Button>
              
              <Button
                onClick={() => setIsRegisterOpen(true)}
                variant="secondary"
                className="w-full"
              >
                Mở Modal Đăng Ký
              </Button>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Yêu cầu kiểm tra:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Số điện thoại bắt buộc khi đăng ký</li>
                  <li>✅ Validation form đầy đủ</li>
                  <li>✅ Chuyển đổi giữa Login/Register</li>
                  <li>✅ Responsive trên PC</li>
                  <li>✅ Lưu thông tin user vào database</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Feature Requirements */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Yêu Cầu Tính Năng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Đăng Ký:</h3>
              <ul className="text-sm space-y-1">
                <li>• Họ và tên (bắt buộc)</li>
                <li>• Email (bắt buộc, validation)</li>
                <li>• Số điện thoại (bắt buộc, format VN)</li>
                <li>• Mật khẩu (bắt buộc, 8+ ký tự, có chữ hoa/thường/số)</li>
                <li>• Tạo profile trong user_profiles table</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Đăng Nhập:</h3>
              <ul className="text-sm space-y-1">
                <li>• Email/Password authentication</li>
                <li>• Google OAuth (optional)</li>
                <li>• Facebook OAuth (optional)</li>
                <li>• Remember me option</li>
                <li>• Forgot password link</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Auth Modals */}
      <AuthModals
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onCloseLogin={() => setIsLoginOpen(false)}
        onCloseRegister={() => setIsRegisterOpen(false)}
        onOpenLogin={() => {
          setIsLoginOpen(true);
          setIsRegisterOpen(false);
        }}
        onOpenRegister={() => {
          setIsRegisterOpen(true);
          setIsLoginOpen(false);
        }}
      />
    </div>
  );
} 