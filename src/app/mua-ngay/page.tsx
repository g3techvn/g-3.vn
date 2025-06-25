'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useBuyNow } from '@/context/BuyNowContext';
import { useCurrentUser } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingOutlined } from '@ant-design/icons';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import LocationSelector from '@/components/features/cart/LocationSelector';
import { CartItem } from '@/types/cart';

// Interface for location selection
interface LocationSelection {
  provinceCode: number;
  provinceName: string;
  districtCode: number;
  districtName: string;
  wardCode: number;
  wardName: string;
}

// Interface for form data
interface FormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  cityCode: number;
  district: string;
  districtCode: number;
  ward: string;
  wardCode: number;
  note: string;
  paymentMethod: string;
}

export default function BuyNowPage() {
  const router = useRouter();
  const { buyNowItem, clearBuyNowItem } = useBuyNow();
  const { data: user } = useCurrentUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Convert single item to array for compatibility
  const items: CartItem[] = buyNowItem ? [buyNowItem] : [];

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    cityCode: 0,
    district: '',
    districtCode: 0,
    ward: '',
    wardCode: 0,
    note: '',
    paymentMethod: 'cod'
  });

  // Location selection state
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection>({
    provinceCode: 0,
    provinceName: '',
    districtCode: 0,
    districtName: '',
    wardCode: 0,
    wardName: ''
  });

  // Handle location selection changes
  const handleLocationChange = {
    province: (code: number, name: string) => {
      setSelectedLocation(prev => ({
        ...prev,
        provinceCode: code,
        provinceName: name,
        districtCode: 0,
        districtName: '',
        wardCode: 0,
        wardName: ''
      }));
      // Update form data
      setFormData(prev => ({
        ...prev,
        city: name,
        cityCode: code,
        district: '',
        districtCode: 0,
        ward: '',
        wardCode: 0
      }));
    },
    district: (code: number, name: string) => {
      setSelectedLocation(prev => ({
        ...prev,
        districtCode: code,
        districtName: name,
        wardCode: 0,
        wardName: ''
      }));
      setFormData(prev => ({
        ...prev,
        district: name,
        districtCode: code,
        ward: '',
        wardCode: 0
      }));
    },
    ward: (code: number, name: string) => {
      setSelectedLocation(prev => ({
        ...prev,
        wardCode: code,
        wardName: name
      }));
      setFormData(prev => ({
        ...prev,
        ward: name,
        wardCode: code
      }));
    }
  };

  // Auto-fill user information when user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  // Redirect if no items
  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
      return;
    }
  }, [items, router]);

  // Calculate totals
  const subtotal = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  const shippingFee = 0; // Free shipping
  const totalPrice = subtotal + shippingFee;

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const hasRequiredBuyerInfo = !!(formData.fullName && formData.phone);
    const hasRequiredShippingInfo = !!(
      formData.address && 
      formData.cityCode && 
      formData.districtCode && 
      formData.wardCode
    );
    const hasPaymentMethod = formData.paymentMethod !== '';
    
    return hasRequiredBuyerInfo && hasRequiredShippingInfo && hasPaymentMethod;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'destructive');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        user_id: user?.id || null,
        buyer_info: {
          fullName: user?.fullName || formData.fullName,
          phone: formData.phone,
          email: user?.email || formData.email
        },
        shipping_info: {
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
          note: formData.note
        },
        payment_method: formData.paymentMethod,
        cart_items: items,
        total_price: totalPrice,
        shipping_fee: shippingFee
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = result.error || 'Có lỗi xảy ra khi tạo đơn hàng';
        if (result.details && Array.isArray(result.details)) {
          errorMessage += '\n\nChi tiết lỗi:\n' + result.details.join('\n');
        }
        throw new Error(errorMessage);
      }

      if (result.success) {
        // Clear buy now items after successful order
        clearBuyNowItem();
        
        // Redirect to thank you page with secure token
        window.location.href = `/cam-on?token=${result.order.accessToken}`;
      } else {
        throw new Error('Có lỗi xảy ra khi tạo đơn hàng');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      showToast(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Mua ngay</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buyer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Thông tin người mua
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleFormChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    placeholder="Nhập email (tùy chọn)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Thông tin giao hàng
              </h2>
              
              {/* Location Selection */}
              <div className="mb-4">
                <LocationSelector
                  selectedProvinceCode={selectedLocation.provinceCode}
                  selectedDistrictCode={selectedLocation.districtCode}
                  selectedWardCode={selectedLocation.wardCode}
                  onProvinceChange={handleLocationChange.province}
                  onDistrictChange={handleLocationChange.district}
                  onWardChange={handleLocationChange.ward}
                />
              </div>
              
              {/* Address input */}
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ cụ thể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  placeholder="Số nhà, tên đường..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Shipping carrier info */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Giao hàng bởi G3-Tech</h4>
                    <p className="text-sm text-green-700 mt-1">
                      <span className="font-medium">Freeship toàn quốc</span> - Nội thành HN, HCM trong ngày, liên tỉnh 2-3 ngày
                    </p>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleFormChange('note', e.target.value)}
                  placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-sm text-gray-500">Thanh toán tiền mặt khi nhận hàng</div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Chuyển khoản ngân hàng</div>
                    <div className="text-sm text-gray-500">Chuyển khoản qua tài khoản ngân hàng</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Đơn hàng của bạn
              </h2>
              
              {/* Product list */}
              <div className="space-y-4 mb-6">
                {items.map((item: CartItem, index: number) => (
                  <div key={index} className="flex space-x-3">
                    <div className="relative">
                      <Image
                        src={item.image || '/images/placeholder-product.jpg'}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover rounded-lg"
                      />
                      <Badge 
                        variant="error" 
                        className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center bg-red-600 text-white text-xs"
                      >
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {typeof item.variant === 'object' 
                            ? `${item.variant.color || ''} ${item.variant.size || ''}`.trim()
                            : item.variant
                          }
                        </p>
                      )}
                      <p className="text-sm font-medium text-red-600">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="text-gray-900">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-medium border-t pt-2">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !isFormValid()}
                className="w-full mt-6 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <LoadingOutlined className="mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  'Đặt hàng ngay'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 