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
import { safeFetch } from '@/lib/utils/fetch-utils';

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
  role?: string;
  auth_users?: {
    email: string;
    phone?: string;
    created_at: string;
  };
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

  const [errors, setErrors] = useState({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: ''
  });

  const validateForm = () => {
    const newErrors = {
      full_name: '',
      phone: '',
      address: '',
      date_of_birth: '',
      gender: ''
    };

    if (profileForm.phone && !/^[0-9]{10}$/.test(profileForm.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10 chữ số';
    }

    if (profileForm.date_of_birth) {
      const date = new Date(profileForm.date_of_birth);
      if (date > new Date()) {
        newErrors.date_of_birth = 'Ngày sinh không thể là ngày trong tương lai';
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  useEffect(() => {
    if (!user || authLoading) return;
    loadUserData();
  }, [user, authLoading]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading user data...', { userId: user?.id });

      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('❌ No access token available');
        showToast('Vui lòng đăng nhập lại', 'destructive');
        return;
      }

      const response = await safeFetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to load user data:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to load user data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      
      if (!data.profile) {
        console.error('❌ No profile data in response');
        showToast('Lỗi: Không tìm thấy thông tin người dùng', 'destructive');
        return;
      }

      const userProfile = data.profile;
      console.log('📋 User profile:', {
        id: userProfile.id,
        user_id: userProfile.user_id,
        email: userProfile.email,
        auth_user_email: userProfile.auth_users?.email,
        full_name: userProfile.full_name,
        phone: userProfile.phone || userProfile.auth_users?.phone
      });
      
      setProfile(userProfile);
      setProfileForm({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || userProfile.auth_users?.phone || '',
        address: userProfile.address || '',
        date_of_birth: userProfile.date_of_birth || '',
        gender: userProfile.gender || ''
      });
    } catch (error) {
      console.error('❌ Error in loadUserData:', error);
      showToast('Lỗi khi tải thông tin người dùng', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    if (!validateForm()) {
      showToast('Vui lòng kiểm tra lại thông tin', 'destructive');
      return;
    }

    try {
      setUpdating(true);

      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        showToast('Vui lòng đăng nhập lại', 'destructive');
        return;
      }

      // Clean up data before sending
      const updateData = {
        ...profileForm,
        // Remove empty date
        date_of_birth: profileForm.date_of_birth || null,
        // Ensure other fields are not empty strings
        full_name: profileForm.full_name.trim() || null,
        phone: profileForm.phone.trim() || null,
        address: profileForm.address.trim() || null,
        gender: profileForm.gender || null
      };

      console.log('📝 Updating profile with data:', updateData);

      const response = await safeFetch('/api/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Failed to update profile:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
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

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-8">Bạn cần đăng nhập để xem thông tin tài khoản.</p>
          <Button 
            onClick={() => router.push('/dang-nhap')}
            className="w-full"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 max-w-7xl">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Thông tin tài khoản
                </h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
                {profile?.created_at && (
                  <p className="text-sm text-gray-500">
                    Tham gia từ {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                  </p>
                )}
        </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            href="/tai-khoan"
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
                  Quay lại
          </Link>
          <Button 
            onClick={handleSignOut}
                  variant="destructive"
                  className="justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </Button>
        </div>
      </div>
          </div>

          {/* Profile Card */}
          <Card className="p-6 md:p-8 shadow-sm border-0">
            
            {/* User Avatar & Info */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {profile?.full_name || 'Chưa cập nhật tên'}
            </h2>
                  {profile?.role && (
                    <Badge 
                      variant={profile.role === 'admin' ? 'error' : 'info'}
                      className="self-start sm:self-auto"
                    >
                      {profile.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-600 font-medium">{profile?.email || user.email}</p>
                
                <div className="flex flex-wrap gap-2">
                  {profile?.created_at && (
                    <Badge variant="info" className="text-xs">
                      Thành viên từ {new Date(profile.created_at).toLocaleDateString('vi-VN')}
                    </Badge>
                  )}
                  {profile?.phone && (
                    <Badge variant="success" className="text-xs">
                      Đã xác minh SĐT
                    </Badge>
            )}
          </div>
        </div>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
                Thông tin cá nhân
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Email Field */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ email
                  </label>
                  <div className="relative">
                    <Input 
                      value={profile?.email || user.email || ''} 
                      disabled 
                      className="bg-gray-50 text-gray-500 pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
          </div>
          
                {/* Full Name */}
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
            <Input
              value={profileForm.full_name}
              onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
              placeholder="Nhập họ và tên đầy đủ"
                    className={`transition-colors ${errors.full_name ? 'border-red-500 focus:border-red-500' : 'focus:border-red-500'}`}
                  />
                  {errors.full_name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.full_name}
                    </p>
                  )}
          </div>
          
                {/* Phone */}
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                    {profile?.phone && (
                      <Badge variant="info" className="ml-2 text-xs">
                        Hiện tại: {profile.phone}
                      </Badge>
              )}
            </label>
            <Input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setProfileForm({...profileForm, phone: value});
              }}
                    placeholder="Nhập số điện thoại"
              maxLength={10}
                    className={`transition-colors ${errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-red-500'}`}
            />
                  {errors.phone ? (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phone}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Để nhận thông báo về đơn hàng</p>
                  )}
          </div>
          
                {/* Date of Birth */}
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
            <Input
              type="date"
              value={profileForm.date_of_birth}
              onChange={(e) => setProfileForm({...profileForm, date_of_birth: e.target.value})}
                    className={`transition-colors ${errors.date_of_birth ? 'border-red-500 focus:border-red-500' : 'focus:border-red-500'}`}
                  />
                  {errors.date_of_birth && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.date_of_birth}
                    </p>
                  )}
          </div>
          
                {/* Gender */}
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
            <select
              value={profileForm.gender}
              onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                      errors.gender ? 'border-red-500' : 'border-gray-300'
                    } bg-white`}
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
                  {errors.gender && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.gender}
                    </p>
                  )}
                </div>
                
                {/* Address */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <Input
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    placeholder="Nhập địa chỉ đầy đủ"
                    className={`transition-colors ${errors.address ? 'border-red-500 focus:border-red-500' : 'focus:border-red-500'}`}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.address}
                    </p>
                  )}
          </div>
        </div>
        
              {/* Update Button */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button
            onClick={updateProfile}
            disabled={updating}
                    className="w-full sm:w-auto px-8 py-3 font-medium"
          >
            {updating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang cập nhật...
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Cập nhật thông tin
                      </>
            )}
          </Button>
                </div>
              </div>
        </div>
      </Card>
        </div>
      </div>
    </div>
  );
} 