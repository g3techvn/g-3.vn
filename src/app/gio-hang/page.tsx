'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { generatePDF } from '@/components/PDFGenerator';
import { useAuth } from '@/features/auth/AuthProvider';
import { Drawer } from 'antd';

// Import new components
import CartHeader from '@/components/mobile/gio-hang/CartHeader';
import ProductList from '@/components/mobile/gio-hang/ProductList';
import BuyerInfo from '@/components/mobile/gio-hang/BuyerInfo';
import ShippingInfo from '@/components/mobile/gio-hang/ShippingInfo';
import VoucherInfo from '@/components/mobile/gio-hang/VoucherInfo';
import PaymentDetails from '@/components/mobile/gio-hang/PaymentDetails';
import BottomBar from '@/components/mobile/gio-hang/BottomBar';

interface LocationData {
  code: number;
  name: string;
  districts?: LocationData[];
  wards?: LocationData[];
}

interface LocationResponse {
  code: number;
  name: string;
  districts: LocationData[];
  wards: LocationData[];
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

  // Location data state
  const [cities, setCities] = useState<Array<{code: number, name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{code: number, name: string}>>([]);
  const [wards, setWards] = useState<Array<{code: number, name: string}>>([]);

  // Loading states for location data
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

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
      id: 'bank',
      name: 'Chuyển khoản ngân hàng',
      icon: 'bank',
      description: 'Chuyển khoản qua tài khoản ngân hàng'
    }
  ]);

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data: LocationData[] = await response.json();
        setCities(data.map((city) => ({
          code: city.code,
          name: city.name
        })));
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
      setLoadingCities(false);
    };

    fetchCities();
  }, []);

  // Fetch districts when city changes
  const fetchDistricts = async (cityCode: number) => {
    setLoadingDistricts(true);
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${cityCode}?depth=2`);
      const data: LocationResponse = await response.json();
      setDistricts(data.districts.map((district) => ({
        code: district.code,
        name: district.name
      })));
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
    setLoadingDistricts(false);
  };

  // Fetch wards when district changes
  const fetchWards = async (districtCode: number) => {
    setLoadingWards(true);
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
      const data: LocationResponse = await response.json();
      setWards(data.wards.map((ward) => ({
        code: ward.code,
        name: ward.name
      })));
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
    setLoadingWards(false);
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

        <ShippingInfo 
          addressForm={addressForm}
          setAddressForm={setAddressForm}
          selectedCarrier={selectedCarrier}
          setSelectedCarrier={setSelectedCarrier}
          carriers={carriers}
          cities={cities}
          districts={districts}
          wards={wards}
          loadingCities={loadingCities}
          loadingDistricts={loadingDistricts}
          loadingWards={loadingWards}
          showAddressDrawer={showAddressDrawer}
          setShowAddressDrawer={setShowAddressDrawer}
          showShippingDrawer={showShippingDrawer}
          setShowShippingDrawer={setShowShippingDrawer}
          fetchDistricts={fetchDistricts}
          fetchWards={fetchWards}
          note={note}
          setNote={setNote}
        />

        <VoucherInfo 
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
    </div>
  );
} 