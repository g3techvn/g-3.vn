'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
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
  updated_at?: string;
}

interface Order {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  customer_name: string;
  shipping_address: string;
  payment_method: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
}

interface ShippingAddress {
  id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  district: string;
  ward?: string;
  is_default: boolean;
}

export default function UserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { showToast } = useToast();

  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    date_of_birth: '',
    gender: ''
  });

  const supabase = createBrowserClient();

  // Load user data
  useEffect(() => {
    if (!user || authLoading) return;
    
    loadUserData();
  }, [user, authLoading]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load profile, orders, and addresses in parallel
      const [profileRes, ordersRes, addressesRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/user/orders'),
        fetch('/api/user/addresses')
      ]);

      if (profileRes.ok) {
        const { profile: userProfile } = await profileRes.json();
        setProfile(userProfile);
        setProfileForm({
          full_name: userProfile.full_name || '',
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          date_of_birth: userProfile.date_of_birth || '',
          gender: userProfile.gender || ''
        });
      }

      if (ordersRes.ok) {
        const { orders: userOrders } = await ordersRes.json();
        setOrders(userOrders || []);
      }

      if (addressesRes.ok) {
        const { addresses: userAddresses } = await addressesRes.json();
        setAddresses(userAddresses || []);
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

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'processing': 'Đang xử lý',
      'shipped': 'Đã gửi hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
        <p>Bạn cần đăng nhập để xem thông tin tài khoản.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tài khoản của tôi</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="addresses">Địa chỉ giao hàng</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={user.email || ''} disabled />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                <Input
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                  placeholder="Nhập họ và tên"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                <Input
                  type="date"
                  value={profileForm.date_of_birth}
                  onChange={(e) => setProfileForm({...profileForm, date_of_birth: e.target.value})}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <Input
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  placeholder="Nhập địa chỉ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Giới tính</label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={updateProfile} 
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Đơn hàng của tôi</h2>
            
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Bạn chưa có đơn hàng nào.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">Đơn hàng #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {getOrderStatusText(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Người nhận:</strong> {order.customer_name}</p>
                        <p><strong>Địa chỉ:</strong> {order.shipping_address}</p>
                      </div>
                      <div>
                        <p><strong>Thanh toán:</strong> {order.payment_method}</p>
                        <p><strong>Tổng tiền:</strong> {order.total_price.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                    
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium mb-2">Sản phẩm:</h4>
                        <div className="space-y-2">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.product_name} x{item.quantity}</span>
                              <span>{item.total_price.toLocaleString('vi-VN')}đ</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Địa chỉ giao hàng</h2>
            
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Bạn chưa có địa chỉ giao hàng nào.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4 relative">
                    {address.is_default && (
                      <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                        Mặc định
                      </Badge>
                    )}
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">{address.full_name}</h3>
                      <p className="text-sm text-gray-600">{address.phone}</p>
                      <p className="text-sm text-gray-600">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.ward && `${address.ward}, `}
                        {address.district}, {address.city}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6">
              <Button className="bg-green-600 hover:bg-green-700">
                + Thêm địa chỉ mới
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 