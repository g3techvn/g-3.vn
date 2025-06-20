'use client'

import { useState, useEffect } from 'react'
import { Modal, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/features/auth/AuthProvider'
import { Voucher } from '@/types/cart'
import { getProvinces, getDistricts, getWards, type Province, type District, type Ward } from '@/lib/provinces'
import { generatePDF } from '@/components/PDFGenerator'
import type { ButtonProps } from 'antd'

// Import components
import BuyerInfo from './BuyerInfo'
import ShippingInfo from './ShippingInfo'
import PaymentMethodSelection from './PaymentMethodSelection'
import OrderSummary from './OrderSummary'
import VoucherInfo from './VoucherInfo'
import RewardPoints from './RewardPoints'
import ProductList from './ProductList'
import CollapsibleSection from './CollapsibleSection'
import ProfileDrawer from './ProfileDrawer'

// Define types
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

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  closeAll: () => void;
}

interface ButtonWithTitleProps extends ButtonProps {
  title?: string;
  className?: string;
}

export default function Checkout({ isOpen, onClose, closeAll }: CheckoutProps) {
  const { cartItems, totalPrice, removeFromCart, updateQuantity } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfRetryCount, setPdfRetryCount] = useState(0)
  const [shippingFee] = useState(0) // Default shipping fee is 0
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
  })

  // State for components
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false)
  const [showVoucherDrawer, setShowVoucherDrawer] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [useRewardPoints, setUseRewardPoints] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Payment methods state
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
  ])
  const [shippingCarriers, setShippingCarriers] = useState([
    {
      id: 'free',
      code: 'FREE',
      name: 'Miễn phí giao hàng',
      base_fee: 0,
      estimated_delivery_days: 1
    }
  ])

  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([])
  
  // Fetch vouchers from API
  const fetchVouchers = async () => {
    try {
      const url = user ? `/api/vouchers?user_id=${user.id}` : '/api/vouchers'
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok && data.vouchers) {
        setAvailableVouchers(data.vouchers.map((v: any) => ({
          id: v.id,
          code: v.code,
          title: v.title,
          description: v.description,
          discountAmount: v.discount_amount,
          minOrderValue: v.min_order_value,
          expiryDate: v.valid_to
        })))
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    }
  }

  const rewardPointsData = {
    available: 1000,
    pointValue: 1000,
    minPointsToRedeem: 100,
    maxPointsPerOrder: 500
  }

  // State for new props
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true)
        const data = await getProvinces()
        setProvinces(data)
      } catch (error) {
        console.error('Error fetching provinces:', error)
      } finally {
        setLoadingProvinces(false)
      }
    }

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

    const fetchShippingCarriers = async () => {
      try {
        const response = await fetch('/api/shipping-carriers')
        const data = await response.json()
        
        if (response.ok && data.shippingCarriers) {
          setShippingCarriers(data.shippingCarriers)
        }
      } catch (error) {
        console.error('Error fetching shipping carriers:', error)
      }
    }

    fetchProvinces()
    fetchPaymentMethods()
    fetchShippingCarriers()
  }, [])

  // Fetch vouchers when user changes
  useEffect(() => {
    fetchVouchers()
  }, [user])

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

  const fetchDistricts = async (provinceCode: number) => {
    try {
      setLoadingDistricts(true)
      setDistricts([])
      setWards([])
      const data = await getDistricts(provinceCode)
      setDistricts(data)
    } catch (error) {
      console.error('Error fetching districts:', error)
    } finally {
      setLoadingDistricts(false)
    }
  }

  const fetchWards = async (districtCode: number) => {
    try {
      setLoadingWards(true)
      setWards([])
      const data = await getWards(districtCode)
      setWards(data)
    } catch (error) {
      console.error('Error fetching wards:', error)
    } finally {
      setLoadingWards(false)
    }
  }

  // Form validation
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
    const hasRequiredFields = !!(formData.paymentMethod);
    return hasRequiredFields;
  };

  const isVoucherCompleted = () => {
    return true; // Optional field
  };

  const isRewardPointsCompleted = () => {
    return true; // Optional field
  };

  const isFormValid = () => {
    return isBuyerInfoCompleted() && 
           isShippingInfoCompleted() && 
           isPaymentMethodCompleted();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) {
      let errorMessage = 'Vui lòng điền đầy đủ thông tin bắt buộc:\n'
      if (!isBuyerInfoCompleted()) errorMessage += '- Thông tin người mua\n'
      if (!isShippingInfoCompleted()) errorMessage += '- Địa chỉ giao hàng\n'
      if (!isPaymentMethodCompleted()) errorMessage += '- Phương thức thanh toán\n'
      alert(errorMessage)
      return
    }

    setLoading(true)
    
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
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra khi tạo đơn hàng')
      }

      if (result.success) {
        alert(`Đặt hàng thành công! Mã đơn hàng: #${result.order.id}`)
        
        // Clear cart after successful order
        cartItems.forEach(item => removeFromCart(item.id))
        
        closeAll()
      } else {
        throw new Error('Có lỗi xảy ra khi tạo đơn hàng')
      }
    } catch (error) {
      console.error('Order submission error:', error)
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreviewPDF = async () => {
    try {
      setPdfLoading(true)
      setPdfError(null)
      setPdfRetryCount(prev => prev + 1)
      
      const pdfDataUri = await generatePDF({
        cartItems,
              totalPrice,
      shipping: 0,
      buyerInfo: {
          fullName: user?.fullName || formData.fullName,
          phone: user?.phone || formData.phone,
          email: user?.email || formData.email,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          note: formData.note
        },
        paymentMethod: formData.paymentMethod,
        voucher: selectedVoucher,
        rewardPoints: useRewardPoints ? pointsToUse : 0,
        preview: true
      });
      
      if (!pdfDataUri) {
        throw new Error('Không thể tạo PDF. Vui lòng thử lại sau.');
      }
      
      setPdfPreviewUrl(pdfDataUri);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      setPdfError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại sau.');
    } finally {
      setPdfLoading(false)
    }
  };

  const handleClosePdfPreview = () => {
    setPdfPreviewUrl(null)
    setPdfError(null)
    setPdfRetryCount(0)
  };

  const handleDownloadPDF = () => {
    generatePDF({
      cartItems,
      totalPrice,
      shipping: 0,
      buyerInfo: {
        fullName: user?.fullName || formData.fullName,
        phone: user?.phone || formData.phone,
        email: user?.email || formData.email,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
        note: formData.note
      },
      paymentMethod: formData.paymentMethod,
      voucher: selectedVoucher,
      rewardPoints: useRewardPoints ? pointsToUse : 0
    });
  };

  // Handle closing both checkout and cart
  const handleClose = () => {
    onClose() // Close checkout
    closeAll() // Close cart
  }

  // Profile drawer functions
  const openProfile = () => {
    setIsProfileOpen(true);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  // Handle quantity update with synchronization
  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }

  // Early return if not open
  if (!isOpen) return null

  return (
    <>
      <Modal
        title={
          <div className="flex w-full justify-between items-center">
            <h2 className="text-xl font-semibold">Thanh toán</h2>
            <div className="flex items-center gap-2">
              {/* User Account Button */}
              <button 
                onClick={openProfile} 
                className="p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                title="Tài khoản"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <button
                onClick={handlePreviewPDF}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Xem trước PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Tải PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </button>
            </div>
          </div>
        }
        open={isOpen}
        onCancel={handleClose}
        width={1200}
        className="checkout-modal"
        mask={true}
        maskClosable={false}
        footer={null}
        styles={{
          body: {
            paddingBottom: 80,
            overflow: 'visible',
            padding: '16px',
            backgroundColor: '#f3f4f6'
          },
          header: {
            padding: '16px 24px'
          },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          content: {
            overflow: 'visible'
          }
        }}
      >
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10">
            <div className="flex flex-col items-center">
              <LoadingOutlined style={{ fontSize: 24, color: '#dc3545', marginBottom: 8 }} />
              <span className="text-gray-600">Đang xử lý đơn hàng...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Left column - Form sections */}
          <div className="col-span-8 space-y-4">
            <CollapsibleSection 
              title="Thông tin người mua" 
              stepNumber={1}
              isCompleted={isBuyerInfoCompleted()}
            >
              <BuyerInfo
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
                showDrawer={showMenu}
                setShowDrawer={setShowMenu}
              />
            </CollapsibleSection>

            <CollapsibleSection 
              title="Thông tin giao hàng" 
              stepNumber={2}
              isCompleted={isShippingInfoCompleted()}
            >
              <ShippingInfo
                addressForm={{
                  city: formData.city,
                  cityCode: formData.cityCode,
                  district: formData.district,
                  districtCode: formData.districtCode,
                  ward: formData.ward,
                  wardCode: formData.wardCode,
                  address: formData.address
                }}
                setAddressForm={(info) => {
                  if (typeof info === 'function') {
                    setFormData(prev => {
                      const newAddressForm = info({
                        city: prev.city,
                        cityCode: prev.cityCode,
                        district: prev.district,
                        districtCode: prev.districtCode,
                        ward: prev.ward,
                        wardCode: prev.wardCode,
                        address: prev.address
                      });
                      return {
                        ...prev,
                        ...newAddressForm
                      };
                    });
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      ...info
                    }));
                  }
                }}
                selectedCarrier="g3tech"
                setSelectedCarrier={() => {}}
                carriers={[
                  {
                    id: 'g3tech',
                    name: 'Giao hàng bởi G3-Tech',
                    price: 0,
                    estimatedTime: 'Freeship toàn quốc - Nội thành HN, HCM trong ngày, liên tỉnh 2-3 ngày'
                  }
                ]}
                provinces={provinces}
                districts={districts}
                wards={wards}
                loadingProvinces={loadingProvinces}
                loadingDistricts={loadingDistricts}
                loadingWards={loadingWards}
                showAddressDrawer={false}
                setShowAddressDrawer={() => {}}
                showShippingDrawer={false}
                setShowShippingDrawer={() => {}}
                fetchDistricts={fetchDistricts}
                fetchWards={fetchWards}
                note={formData.note}
                setNote={(note) => handleFormChange('note', note)}
                cartItems={cartItems}
              />
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
                openProfile={openProfile}
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
                openProfile={openProfile}
              />
            </CollapsibleSection>
          </div>

          {/* Right column - Order summary */}
          <div className="col-span-4">
            <div className="bg-white p-4 rounded-lg sticky top-4">
              <ProductList
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
                type="primary"
                danger
                block
                size="large"
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className="mt-4"
              >
                Đặt hàng
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-lg font-semibold">Xem trước PDF</span>
            </div>
          </div>
        }
        open={!!pdfPreviewUrl}
        onCancel={handleClosePdfPreview}
        width="90%"
        style={{ top: 20 }}
        styles={{ 
          body: { 
            padding: '24px',
            height: 'calc(100vh - 200px)',
            overflow: 'hidden'
          }
        }}
        footer={null}
        className="pdf-preview-modal"
        maskClosable={true}
        keyboard={true}
        transitionName="fade"
      >
        <div className="w-full h-full transition-all duration-300 ease-in-out">
          {pdfLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg animate-fade-in">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping">
                    <LoadingOutlined style={{ fontSize: 32, color: '#dc3545', opacity: 0.3 }} />
                  </div>
                  <LoadingOutlined style={{ fontSize: 32, color: '#dc3545' }} />
                </div>
                <div className="mt-4 space-y-2 text-center">
                  <span className="text-gray-600 block">Đang tạo PDF...</span>
                  <span className="text-gray-400 text-sm block">Vui lòng đợi trong giây lát</span>
                  <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-red-600 rounded-full animate-progress"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : pdfError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg animate-fade-in">
              <div className="text-center max-w-md px-4">
                <div className="text-red-500 mb-4 animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2 text-lg font-medium">{pdfError}</p>
                {pdfRetryCount > 1 && (
                  <p className="text-gray-500 mb-4 text-sm">
                    Đã thử lại {pdfRetryCount} lần. Vui lòng kiểm tra kết nối và thử lại.
                  </p>
                )}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handlePreviewPDF}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center shadow-sm hover:shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Thử lại
                  </button>
                  <button
                    onClick={handleClosePdfPreview}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors shadow-sm hover:shadow-md"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden animate-fade-in">
              <iframe
                src={pdfPreviewUrl || undefined}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Profile Drawer */}
      <ProfileDrawer isOpen={isProfileOpen} onClose={closeProfile} />

      <style jsx global>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-enter {
          opacity: 0;
        }
        .fade-enter-active {
          opacity: 1;
          transition: opacity 300ms ease-in-out;
        }
        .fade-exit {
          opacity: 1;
        }
        .fade-exit-active {
          opacity: 0;
          transition: opacity 300ms ease-in-out;
        }
      `}</style>
    </>
  )
}
