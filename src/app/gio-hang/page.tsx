'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { generatePDF } from '@/components/PDFGenerator';
import { useAuth } from '@/features/auth/AuthProvider';
import Drawer from 'antd/es/drawer';
import { LoadingOutlined } from '@ant-design/icons';
import LocationSelector from '@/components/features/cart/LocationSelector';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';

// Import new components
import CartHeader from '@/components/features/cart/CartHeader';
import ProductList from '@/components/features/cart/ProductList';
import BuyerInfo from '@/components/features/cart/BuyerInfo';
import VoucherInfo from '@/components/features/cart/VoucherInfo';
import PaymentDetails from '@/components/features/cart/PaymentDetails';
import BottomBar from '@/components/features/cart/BottomBar';

// Import store components exactly like checkout modal
import BuyerInfoStore from '@/components/store/BuyerInfo';
import PaymentMethodSelection from '@/components/store/PaymentMethodSelection';
import OrderSummary from '@/components/store/OrderSummary';
import VoucherInfoStore from '@/components/store/VoucherInfo';
import RewardPoints from '@/components/store/RewardPoints';
import ProductListStore from '@/components/store/ProductList';
import CollapsibleSection from '@/components/store/CollapsibleSection';
import ProfileDrawer from '@/components/store/ProfileDrawer';

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

// Define form data interface like checkout
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
  voucher: string;
  rewardPoints: number;
}

export default function CartPage() {
  const { cartItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [shippingFee] = useState(0); // Default shipping fee is 0
  const { showToast } = useToast();
  
  // Form data state like checkout
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
    paymentMethod: '',
    voucher: '',
    rewardPoints: 0
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

  // Add voucher state
  const [showVoucherDrawer, setShowVoucherDrawer] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);

  // Add reward points state
  const [useRewardPoints, setUseRewardPoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [rewardPointsData, setRewardPointsData] = useState({
    available: 0,
    pointValue: 1000,
    minPointsToRedeem: 100,
    maxPointsPerOrder: 500
  });

  // Add payment method state
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'cod',
      code: 'cod',
      name: 'Thanh toán khi nhận hàng',
      icon: 'cod',
      description: 'Thanh toán tiền mặt khi nhận hàng'
    },
    {
      id: 'bank_transfer',
      code: 'bank_transfer',
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

  // Fetch vouchers from API
  const fetchVouchers = async () => {
    try {
      const url = user ? `/api/vouchers?user_id=${user.id}` : '/api/vouchers'
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok && data.vouchers) {
        setAvailableVouchers(data.vouchers.map((v: any, index: number) => ({
          id: v.id || `voucher-${index}`, // Fallback if id is missing
          code: v.code || '',
          title: v.title || '',
          description: v.description || '',
          discountAmount: v.discount_amount || 0,
          minOrderValue: v.min_order_value || 0,
          expiryDate: v.valid_to || new Date().toISOString()
        })).filter((v: Voucher) => v.id && v.code)) // Only include vouchers with valid id and code
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    }
  }

  // Fetch payment methods from API
  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods')
      const data = await response.json()
      
      if (response.ok && data.paymentMethods) {
        setPaymentMethods(data.paymentMethods.map((pm: any) => ({
          id: pm.code,
          code: pm.code,
          name: pm.name,
          icon: pm.icon,
          description: pm.description
        })))
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  // Fetch shipping carriers from API
  const fetchShippingCarriers = async () => {
    try {
      const response = await fetch('/api/shipping-carriers')
      const data = await response.json()
      
      if (response.ok && data.shippingCarriers) {
        // Store shipping carriers if needed for display
        console.log('Shipping carriers:', data.shippingCarriers)
      }
    } catch (error) {
      console.error('Error fetching shipping carriers:', error)
    }
  }

  // Fetch reward points data from API
  const fetchRewardPoints = async () => {
    if (!user) {
      setRewardPointsData(prev => ({ ...prev, available: 0 }));
      return;
    }

    try {
      const response = await fetch(`/api/user/rewards?user_id=${user.id}`)
      const data = await response.json()
      
      if (response.ok && data.points) {
        setRewardPointsData(prev => ({
          ...prev,
          available: data.points.available,
          pointValue: data.points.pointValue,
          minPointsToRedeem: data.points.minPointsToRedeem,
          maxPointsPerOrder: data.points.maxPointsPerOrder
        }));
        
        console.log('Reward points loaded:', data.points);
      } else {
        // Fallback to default values if API fails
        setRewardPointsData(prev => ({ ...prev, available: 0 }));
      }
    } catch (error) {
      console.error('Error fetching reward points:', error)
      setRewardPointsData(prev => ({ ...prev, available: 0 }));
    }
  }

  // Fetch data on mount
  useEffect(() => {
    fetchPaymentMethods()
    fetchShippingCarriers()
  }, [])

  // Fetch vouchers and reward points when user changes
  useEffect(() => {
    fetchVouchers();
    fetchRewardPoints();
  }, [user]);

  // Auto-fill user information when user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone, // Auto-fill phone if available
      }))
    }
  }, [user])

  // Completion check functions like checkout
  const isBuyerInfoCompleted = () => {
    // If user is logged in, buyer info is automatically completed from user profile
    if (user) {
      // Only require phone if user doesn't have it in profile
      return user.phone ? true : !!formData.phone;
    }
    // If user is not logged in, require manual input
    const hasRequiredFields = !!(formData.fullName && formData.phone);
    return hasRequiredFields;
  };

  const isShippingInfoCompleted = () => {
    const hasRequiredFields = !!(
      formData.address && 
      formData.cityCode && 
      formData.districtCode && 
      formData.wardCode
    );
    return hasRequiredFields;
  };

  const isPaymentMethodCompleted = () => {
    return formData.paymentMethod !== '';
  };

  const isVoucherCompleted = () => {
    return true; // Voucher is optional
  };

  const isRewardPointsCompleted = () => {
    return true; // Reward points are optional
  };

  const isFormValid = () => {
    return isBuyerInfoCompleted() && isShippingInfoCompleted() && isPaymentMethodCompleted();
  };

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
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
          phone: user?.phone || formData.phone,
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
        cart_items: cartItems,
        voucher: selectedVoucher,
        reward_points: useRewardPoints ? pointsToUse : 0,
        total_price: totalPrice,
        shipping_fee: shippingFee
      };

      // Log order data for debugging
      console.log('Submitting order data:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Log detailed validation errors for debugging
        console.error('Order validation failed:', result);
        
        // Show detailed error message if available
        let errorMessage = result.error || 'Có lỗi xảy ra khi tạo đơn hàng';
        if (result.details && Array.isArray(result.details)) {
          errorMessage += '\n\nChi tiết lỗi:\n' + result.details.join('\n');
        }
        
        throw new Error(errorMessage);
      }

      if (result.success) {
        // Clear cart after successful order
        clearCart();
        
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

  return (
    <div className="min-h-screen pb-[140px] md:pb-0">
      <CartHeader 
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        handlePreviewPDF={() => generatePDF({ cartItems, totalPrice, shipping: shippingFee, buyerInfo: user ? {
          fullName: user.fullName,
          phone: formData.phone,
          email: user.email
        } : {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email || undefined
        }, preview: true })}
        handleDownloadPDF={() => generatePDF({ cartItems, totalPrice, shipping: shippingFee, buyerInfo: user ? {
          fullName: user.fullName,
          phone: formData.phone,
          email: user.email
        } : {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email || undefined
        }})}
      />

      {/* PC Layout - Exact same as checkout modal */}
      <div className="hidden md:block">
        <div className="bg-gray-100 min-h-screen">
          {loading && (
            <div className="fixed inset-0 bg-white bg-opacity-80 flex justify-center items-center z-50">
              <div className="flex flex-col items-center">
                <LoadingOutlined style={{ fontSize: 24, color: '#dc3545', marginBottom: 8 }} />
                <span className="text-gray-600">Đang xử lý đơn hàng...</span>
              </div>
            </div>
          )}
          
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Left column - Form sections */}
              <div className="col-span-8 space-y-4">
                <CollapsibleSection 
                  title="Thông tin người mua" 
                  stepNumber={1}
                  isCompleted={isBuyerInfoCompleted()}
                >
                  <BuyerInfoStore
                    formData={{
                      fullName: formData.fullName,
                      phone: formData.phone,
                      email: formData.email
                    }}
                    setFormData={(info) => {
                      if (typeof info === 'function') {
                        setFormData(prev => {
                          const newBuyerInfo = info({
                            fullName: prev.fullName,
                            phone: prev.phone,
                            email: prev.email
                          });
                          return {
                            ...prev,
                            ...newBuyerInfo
                          };
                        });
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          ...info
                        }));
                      }
                    }}
                    showDrawer={showProfileDrawer}
                    setShowDrawer={setShowProfileDrawer}
                  />
                </CollapsibleSection>

                <CollapsibleSection 
                  title="Thông tin giao hàng" 
                  stepNumber={2}
                  isCompleted={isShippingInfoCompleted()}
                >
                  {/* Location Selection */}
                  <div className="space-y-4">
                    <LocationSelector
                      selectedProvinceCode={selectedLocation.provinceCode}
                      selectedDistrictCode={selectedLocation.districtCode}
                      selectedWardCode={selectedLocation.wardCode}
                      onProvinceChange={handleLocationChange.province}
                      onDistrictChange={handleLocationChange.district}
                      onWardChange={handleLocationChange.ward}
                    />
                    
                    {/* Address input */}
                    <div>
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
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
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
                </CollapsibleSection>

                <CollapsibleSection 
                  title="Phương thức thanh toán" 
                  stepNumber={3}
                  isCompleted={isPaymentMethodCompleted()}
                >
                  <PaymentMethodSelection
                    showPaymentDrawer={showPaymentDrawer}
                    setShowPaymentDrawer={setShowPaymentDrawer}
                    selectedPayment={formData.paymentMethod}
                    setSelectedPayment={(method) => handleFormChange('paymentMethod', method)}
                    paymentMethods={paymentMethods}
                  />
                </CollapsibleSection>

                <CollapsibleSection 
                  title="Mã giảm giá" 
                  stepNumber={4}
                  isCompleted={isVoucherCompleted()}
                >
                  <VoucherInfoStore
                    user={user}
                    showVoucherDrawer={showVoucherDrawer}
                    setShowVoucherDrawer={setShowVoucherDrawer}
                    voucherCode={formData.voucher}
                    setVoucherCode={(code) => handleFormChange('voucher', code)}
                    selectedVoucher={selectedVoucher}
                    setSelectedVoucher={setSelectedVoucher}
                    availableVouchers={availableVouchers}
                    totalPrice={totalPrice}
                    openProfile={() => setShowProfileDrawer(true)}
                  />
                </CollapsibleSection>

                <CollapsibleSection 
                  title="Điểm thưởng" 
                  stepNumber={5}
                  isCompleted={isRewardPointsCompleted()}
                >
                  <RewardPoints
                    isLoggedIn={!!user}
                    availablePoints={rewardPointsData.available}
                    useRewardPoints={useRewardPoints}
                    setUseRewardPoints={setUseRewardPoints}
                    pointsToUse={pointsToUse}
                    setPointsToUse={setPointsToUse}
                    maxPointsToUse={rewardPointsData.maxPointsPerOrder}
                    openProfile={() => setShowProfileDrawer(true)}
                  />
                </CollapsibleSection>
              </div>

              {/* Right column - Order summary */}
              <div className="col-span-4">
                <div className="bg-white p-4 rounded-lg sticky top-4">
                  <ProductListStore
                    items={cartItems}
                    loading={loading}
                    onUpdateQuantity={handleQuantityUpdate}
                    onRemoveItem={removeFromCart}
                  />
                  <OrderSummary
                    items={cartItems}
                    selectedVoucher={selectedVoucher}
                    pointsToUse={useRewardPoints ? pointsToUse : 0}
                    totalPrice={totalPrice}
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-red-600 text-white hover:bg-red-700"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <LoadingOutlined className="mr-2" />
                        Đang xử lý...
                      </div>
                    ) : (
                      'Đặt hàng'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Keep existing design */}
      <div className="md:hidden">
      <div className="px-4 pb-20 max-w-full overflow-hidden">        
        <ProductList 
          loading={loading}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
        />

        <BuyerInfo 
          user={user}
             guestInfo={{
               fullName: formData.fullName,
               phone: formData.phone,
               email: formData.email
             }}
             setGuestInfo={(info) => {
               if (typeof info === 'function') {
                 setFormData(prev => {
                   const currentInfo = {
                     fullName: prev.fullName,
                     phone: prev.phone,
                     email: prev.email
                   };
                   const newInfo = info(currentInfo);
                   return {
                     ...prev,
                     fullName: newInfo.fullName,
                     phone: newInfo.phone,
                     email: newInfo.email
                   };
                 });
               } else {
                 setFormData(prev => ({
                   ...prev,
                   fullName: info.fullName,
                   phone: info.phone,
                   email: info.email
                 }));
               }
             }}
             userPhone={formData.phone}
             setUserPhone={(phone) => {
               if (typeof phone === 'string') {
                 handleFormChange('phone', phone);
               }
             }}
             errors={{
               fullName: '',
               phone: ''
             }}
             setErrors={() => {}}
        />

        {/* Location Selection */}
        <div className="bg-white ">
          
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
              <label htmlFor="address-mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ cụ thể <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
                id="address-mobile"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
              placeholder="Số nhà, tên đường..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Shipping carrier selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phương thức vận chuyển
            </label>
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="font-medium text-gray-900">Giao hàng bởi G3-Tech</div>
                    <div className="text-sm text-gray-600">
                  Miễn phí • 2-3 ngày
                    </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-4">
              <label htmlFor="note-mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú đơn hàng
            </label>
            <textarea
                id="note-mobile"
                value={formData.note}
                onChange={(e) => handleFormChange('note', e.target.value)}
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
            voucherCode={formData.voucher}
            setVoucherCode={(code) => handleFormChange('voucher', code)}
          selectedVoucher={selectedVoucher}
          setSelectedVoucher={setSelectedVoucher}
          availableVouchers={availableVouchers}
          totalPrice={totalPrice}
        />

        <PaymentDetails 
          user={user}
          totalPrice={totalPrice}
            shipping={shippingFee}
          selectedVoucher={selectedVoucher}
            pointsDiscount={useRewardPoints ? pointsToUse * rewardPointsData.pointValue : 0}
          cartItems={cartItems}
          useRewardPoints={useRewardPoints}
          setUseRewardPoints={setUseRewardPoints}
          pointsToUse={pointsToUse}
          setPointsToUse={setPointsToUse}
            rewardPoints={rewardPointsData}
          showPaymentDrawer={showPaymentDrawer}
          setShowPaymentDrawer={setShowPaymentDrawer}
            selectedPayment={formData.paymentMethod}
            setSelectedPayment={(method) => handleFormChange('paymentMethod', method)}
          paymentMethods={paymentMethods}
        />
      </div>

      <BottomBar 
        cartItemCount={cartItems.length}
        total={totalPrice + shippingFee - (selectedVoucher?.discountAmount || 0) - (useRewardPoints ? pointsToUse * rewardPointsData.pointValue : 0)}
        onCheckout={handleSubmit}
        isValid={isFormValid()}
        loading={loading}
      />
      </div>
      
      {/* Profile Drawer */}
      <ProfileDrawer 
        isOpen={showProfileDrawer} 
        onClose={() => setShowProfileDrawer(false)} 
      />

      {/* Add CSS for collapsible sections */}
      <style jsx global>{`
        .collapsible-arrow {
          transition: transform 0.3s ease;
        }
        .collapsible-arrow.open {
          transform: rotate(180deg);
        }
        .collapsible-content {
          transition: all 0.3s ease;
        }
        .collapsible-content.closed {
          max-height: 0;
          overflow: hidden;
          padding: 0;
        }
        .collapsible-content.open {
          max-height: none;
          overflow: visible;
        }
      `}</style>
    </div>
  );
} 