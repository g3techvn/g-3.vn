'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
  date_of_birth?: string;
  gender?: string;
  created_at?: string;
}

export default function AccountInfoPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: ''
  });

  useEffect(() => {
    if (!user || authLoading) return;
    loadUserData();
  }, [user, authLoading]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user');

      if (response.ok) {
        const { profile: userProfile } = await response.json();
        setProfile(userProfile);
        setProfileForm({
          full_name: userProfile.full_name || '',
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          date_of_birth: userProfile.date_of_birth || '',
          gender: userProfile.gender || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      showToast('Lỗi khi tải thông tin người dùng', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      setUpdating(true);

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const { profile: updatedProfile } = await response.json();
      setProfile(updatedProfile);
      showToast('Cập nhật thông tin thành công!', 'default');

    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Lỗi khi cập nhật thông tin', 'destructive');
    } finally {
      setUpdating(false);
    }
  };

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

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 text-center">
        <div className="py-16">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem thông tin tài khoản.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Thông tin tài khoản</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Link 
            href="/tai-khoan"
            className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại tài khoản
          </Link>
          <Button 
            onClick={handleSignOut}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {profile?.full_name || 'Chưa cập nhật tên'}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            {profile?.created_at && (
              <p className="text-sm text-gray-500">
                Tham gia từ {new Date(profile.created_at).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input value={user.email || ''} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Họ và tên</label>
            <Input
              value={profileForm.full_name}
              onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
              placeholder="Nhập họ và tên đầy đủ"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Số điện thoại {profile?.phone && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Hiện tại: {profile.phone})
                </span>
              )}
            </label>
            <Input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => {
                // Chỉ cho phép nhập số
                const value = e.target.value.replace(/[^0-9]/g, '');
                setProfileForm({...profileForm, phone: value});
              }}
              placeholder={profile?.phone || "Nhập số điện thoại"}
              maxLength={10}
              pattern="[0-9]*"
              className="focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Vui lòng nhập số điện thoại để nhận thông báo về đơn hàng</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Ngày sinh</label>
            <Input
              type="date"
              value={profileForm.date_of_birth}
              onChange={(e) => setProfileForm({...profileForm, date_of_birth: e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Địa chỉ</label>
            <Input
              value={profileForm.address}
              onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
              placeholder="Nhập địa chỉ"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Giới tính</label>
            <select
              value={profileForm.gender}
              onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            onClick={updateProfile}
            disabled={updating}
            className="w-full"
          >
            {updating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Cập nhật thông tin'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
} 