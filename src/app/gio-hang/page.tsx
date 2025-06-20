'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { generatePDF } from '@/components/PDFGenerator';
import { useAuth } from '@/features/auth/AuthProvider';
import { Drawer } from 'antd';
import LocationSelector from '@/components/features/cart/LocationSelector';
import { useToast } from '@/components/ui/Toast';

// Import new components
import CartHeader from '@/components/features/cart/CartHeader';
import ProductList from '@/components/features/cart/ProductList';
import BuyerInfo from '@/components/features/cart/BuyerInfo';

import VoucherInfo from '@/components/features/cart/VoucherInfo';
import PaymentDetails from '@/components/features/cart/PaymentDetails';
import BottomBar from '@/components/features/cart/BottomBar';

interface LocationSelection {
  provinceCode: number;
  provinceName: string;
  districtCode: number;
  districtName: string;
  wardCode: number;
  wardName: string;
}

// Add voucher state and types
interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderValue: number;
  expiryDate: string;
}

// Add reward points state and types
interface RewardPoints {
  available: number;
  pointValue: number; // Value in VND per point
  minPointsToRedeem: number;
  maxPointsPerOrder: number;
}

// Add payment method state and types
interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function CartPage() {
  const { cartItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [showShippingDrawer, setShowShippingDrawer] = useState(false);
  
  // Guest user form state
  const [guestInfo, setGuestInfo] = useState({
    fullName: '',
    phone: '',
    email: ''
  });
  
  // Phone input for logged-in users
  const [userPhone, setUserPhone] = useState('');
  
  // Form validation state
  const [errors, setErrors] = useState({
    fullName: '',
    phone: ''
  });

  // Address state
  const [addressForm, setAddressForm] = useState({
    city: '',
    district: '',
    ward: '',
    address: ''
  });

  // Shipping carrier state
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const carriers = [
    { id: 'g3tech', name: 'Giao hàng bởi G3-Tech', price: 0, time: '2-3 ngày' }
  ];

  // Location selection state
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection>({
    provinceCode: 0,
    provinceName: '',
    districtCode: 0,
    districtName: '',
    wardCode: 0,
    wardName: ''
  });

  // Add state for note
  const [note, setNote] = useState('');

  // Add voucher state
  const [showVoucherDrawer, setShowVoucherDrawer] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [availableVouchers] = useState<Voucher[]>([
    {
      id: '1',
      code: 'WELCOME10',
      title: 'Giảm 10K cho đơn hàng từ 100K',
      description: 'Áp dụng cho tất cả sản phẩm',
      discountAmount: 10000,
      minOrderValue: 100000,
      expiryDate: '2024-12-31'
    },
    {
      id: '2',
      code: 'FREESHIP30',
      title: 'Giảm 30K phí vận chuyển',
      description: 'Áp dụng cho đơn hàng từ 200K',
      discountAmount: 30000,
      minOrderValue: 200000,
      expiryDate: '2024-12-31'
    }
  ]);

  // Add reward points state
  const [useRewardPoints, setUseRewardPoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [rewardPoints] = useState<RewardPoints>({
    available: 150,
    pointValue: 100, // 100 VND per point
    minPointsToRedeem: 50,
    maxPointsPerOrder: 500
  });

  // Add payment method state
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng',
      icon: 'cash',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng'
    },
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      icon: 'bank',
      description: 'Chuyển khoản qua tài khoản ngân hàng'
    }
  ]);

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
      // Update address form for compatibility with ShippingInfo
      setAddressForm(prev => ({
        ...prev,
        city: name,
        district: '',
        ward: ''
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
      setAddressForm(prev => ({
        ...prev,
        district: name,
        ward: ''
      }));
    },
    ward: (code: number, name: string) => {
      setSelectedLocation(prev => ({
        ...prev,
        wardCode: code,
        wardName: name
      }));
      setAddressForm(prev => ({
        ...prev,
        ward: name
      }));
    }
  };

  // Calculate points discount
  const pointsDiscount = useRewardPoints ? pointsToUse * rewardPoints.pointValue : 0;

  // Update total calculation to include points discount
  const shipping = 0;
  const total = totalPrice + shipping - (selectedVoucher?.discountAmount || 0) - pointsDiscount;

  return (
    <div className="min-h-screen bg-gray-100">
      <CartHeader 
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        handlePreviewPDF={() => generatePDF({ cartItems, totalPrice, shipping, buyerInfo: user ? {
          fullName: user.fullName,
          phone: userPhone,
          email: user.email
        } : {
          fullName: guestInfo.fullName,
          phone: guestInfo.phone,
          email: guestInfo.email || undefined
        }, preview: true })}
        handleDownloadPDF={() => generatePDF({ cartItems, totalPrice, shipping, buyerInfo: user ? {
          fullName: user.fullName,
          phone: userPhone,
          email: user.email
        } : {
          fullName: guestInfo.fullName,
          phone: guestInfo.phone,
          email: guestInfo.email || undefined
        }})}
      />

      <div className="px-4 pb-20 max-w-full overflow-hidden">        
        <ProductList 
          loading={loading}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
        />

        <BuyerInfo 
          user={user}
          guestInfo={guestInfo}
          setGuestInfo={setGuestInfo}
          userPhone={userPhone}
          setUserPhone={setUserPhone}
          errors={errors}
          setErrors={setErrors}
        />

        {/* Location Selection */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Địa chỉ giao hàng</h3>
          
          <LocationSelector
            selectedProvinceCode={selectedLocation.provinceCode}
            selectedDistrictCode={selectedLocation.districtCode}
            selectedWardCode={selectedLocation.wardCode}
            onProvinceChange={handleLocationChange.province}
            onDistrictChange={handleLocationChange.district}
            onWardChange={handleLocationChange.ward}
          />
          
          {/* Address input */}
          <div className="mt-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ cụ thể <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={addressForm.address}
              onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Số nhà, tên đường..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Shipping carrier selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phương thức vận chuyển
            </label>
            <div className="space-y-2">
              {carriers.map((carrier) => (
                <label key={carrier.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="carrier"
                    value={carrier.id}
                    checked={selectedCarrier === carrier.id}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{carrier.name}</div>
                    <div className="text-sm text-gray-600">
                      {carrier.price === 0 ? 'Miễn phí' : `${carrier.price.toLocaleString('vi-VN')}đ`} • {carrier.time}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mt-4">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú đơn hàng
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú cho đơn hàng (tùy chọn)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <VoucherInfo 
          user={user}
          showVoucherDrawer={showVoucherDrawer}
          setShowVoucherDrawer={setShowVoucherDrawer}
          voucherCode={voucherCode}
          setVoucherCode={setVoucherCode}
          selectedVoucher={selectedVoucher}
          setSelectedVoucher={setSelectedVoucher}
          availableVouchers={availableVouchers}
          totalPrice={totalPrice}
        />

        <PaymentDetails 
          user={user}
          totalPrice={totalPrice}
          shipping={shipping}
          selectedVoucher={selectedVoucher}
          pointsDiscount={pointsDiscount}
          cartItems={cartItems}
          useRewardPoints={useRewardPoints}
          setUseRewardPoints={setUseRewardPoints}
          pointsToUse={pointsToUse}
          setPointsToUse={setPointsToUse}
          rewardPoints={rewardPoints}
          showPaymentDrawer={showPaymentDrawer}
          setShowPaymentDrawer={setShowPaymentDrawer}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          paymentMethods={paymentMethods}
        />
      </div>

      <BottomBar 
        cartItemCount={cartItems.length}
        total={total}
      />
      
      <ToastComponent />
    </div>
  );
} 