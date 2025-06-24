'use client'

import { useState, useEffect } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { useCart } from '@/context/CartContext'
import { useBuyNow } from '@/context/BuyNowContext'
import { useAuth } from '@/features/auth/AuthProvider'
import { Voucher } from '@/types/cart'
import { generatePDF } from '@/components/PDFGenerator'
import { useToast } from '@/hooks/useToast'
import LocationSelector from '@/components/features/cart/LocationSelector'
import ValidationDebugger from '@/components/debug/ValidationDebugger'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Toaster } from "@/components/ui/Toaster"

// Import components
import BuyerInfo from './BuyerInfo'
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

export default function Checkout({ isOpen, onClose, closeAll }: CheckoutProps) {
  const { cartItems, totalPrice, removeFromCart, updateQuantity } = useCart()
  const { buyNowItem, clearBuyNowItem } = useBuyNow()
  const { user } = useAuth()
  const { showToast } = useToast()
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
  
  // Use either buyNowItem or cartItems based on context
  const items = buyNowItem ? [buyNowItem] : cartItems
  const total = buyNowItem ? buyNowItem.price * buyNowItem.quantity : totalPrice

  // Fetch vouchers from API
  const fetchVouchers = async () => {
    try {
      const url = user ? `/api/vouchers?user_id=${user.id}` : '/api/vouchers'
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok && data.vouchers) {
        setAvailableVouchers(data.vouchers.map((v: any, index: number) => ({
          id: v.id || `voucher-${index}`,
          code: v.code || '',
          title: v.title || '',
          description: v.description || '',
          discountAmount: v.discount_amount || 0,
          minOrderValue: v.min_order_value || 0,
          expiryDate: v.valid_to || new Date().toISOString()
        })).filter((voucher: any) => voucher.id && voucher.code))
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
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
        
        console.log('Reward points loaded in checkout:', data.points);
      } else {
        // Fallback to default values if API fails
        setRewardPointsData(prev => ({ ...prev, available: 0 }));
      }
    } catch (error) {
      console.error('Error fetching reward points:', error)
      setRewardPointsData(prev => ({ ...prev, available: 0 }));
    }
  }

  const [rewardPointsData, setRewardPointsData] = useState({
    available: 0,
    pointValue: 1000,
    minPointsToRedeem: 100,
    maxPointsPerOrder: 500
  });

  // Location selection state
  interface LocationSelection {
    provinceCode: number;
    provinceName: string;
    districtCode: number;
    districtName: string;
    wardCode: number;
    wardName: string;
  }
  
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection>({
    provinceCode: 0,
    provinceName: '',
    districtCode: 0,
    districtName: '',
    wardCode: 0,
    wardName: ''
  });

  // Fetch payment methods from API
  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods')
      const data = await response.json()
      
      if (response.ok && data.methods) {
        setPaymentMethods(data.methods)
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
      
      if (response.ok && data.carriers) {
        setShippingCarriers(data.carriers)
      }
    } catch (error) {
      console.error('Error fetching shipping carriers:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchVouchers()
      fetchRewardPoints()
      fetchPaymentMethods()
      fetchShippingCarriers()
    }
  }, [isOpen, user])

  // Form validation functions
  const isBuyerInfoCompleted = () => {
    return !!(formData.fullName && formData.phone && formData.email)
  }

  const isShippingInfoCompleted = () => {
    return !!(formData.address && formData.city && formData.district && formData.ward)
  }

  const isPaymentMethodCompleted = () => {
    return !!formData.paymentMethod
  }

  const isVoucherCompleted = () => {
    return true // Optional
  }

  const isRewardPointsCompleted = () => {
    return true // Optional
  }

  const isFormValid = () => {
    return isBuyerInfoCompleted() && isShippingInfoCompleted() && isPaymentMethodCompleted()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) {
      showToast('Vui lòng điền đầy đủ thông tin')
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
        cart_items: items,
        voucher: selectedVoucher,
        reward_points: useRewardPoints ? pointsToUse : 0,
        total_price: total,
        shipping_fee: shippingFee,
        is_buy_now: !!buyNowItem
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Đặt hàng thành công')
        handlePreviewPDF()
        if (buyNowItem) {
          clearBuyNowItem()
        }
        closeAll()
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      showToast('Có lỗi xảy ra khi đặt hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePreviewPDF = async () => {
    setPdfLoading(true)
    setPdfError(null)

    try {
      const pdfUrl = await generatePDF({
        cartItems,
        totalPrice,
        shipping: shippingFee,
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
      })

      setPdfPreviewUrl(pdfUrl)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setPdfError('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.')
      setPdfRetryCount(prev => prev + 1)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleClosePdfPreview = () => {
    setPdfPreviewUrl(null)
    setPdfError(null)
    setPdfRetryCount(0)
  }

  const handleDownloadPDF = () => {
    if (pdfPreviewUrl) {
      const link = document.createElement('a')
      link.href = pdfPreviewUrl
      link.download = 'order.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleClose = () => {
    onClose()
    setPdfPreviewUrl(null)
    setPdfError(null)
    setPdfRetryCount(0)
  }

  const openProfile = () => {
    setIsProfileOpen(true)
  }

  const closeProfile = () => {
    setIsProfileOpen(false)
  }

  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    updateQuantity(itemId, newQuantity)
  }

  return (
    <>
      {/* Main Checkout Dialog */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>{buyNowItem ? 'Mua ngay' : 'Thanh toán'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-12 gap-8">
            {/* Left column - Forms */}
            <div className="col-span-8 space-y-6">
              <CollapsibleSection
                title="Thông tin người mua"
                stepNumber={1}
                isCompleted={isBuyerInfoCompleted()}
                defaultOpen={!isBuyerInfoCompleted()}
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
                defaultOpen={!isShippingInfoCompleted()}
              >
                <LocationSelector
                  selectedProvinceCode={selectedLocation.provinceCode}
                  selectedDistrictCode={selectedLocation.districtCode}
                  selectedWardCode={selectedLocation.wardCode}
                  onProvinceChange={(code, name) => {
                    setSelectedLocation(prev => ({
                      ...prev,
                      provinceCode: code,
                      provinceName: name,
                      districtCode: 0,
                      districtName: '',
                      wardCode: 0,
                      wardName: ''
                    }));
                    setFormData(prev => ({
                      ...prev,
                      city: name,
                      cityCode: code,
                      district: '',
                      districtCode: 0,
                      ward: '',
                      wardCode: 0
                    }));
                  }}
                  onDistrictChange={(code, name) => {
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
                  }}
                  onWardChange={(code, name) => {
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
                  }}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Phương thức thanh toán"
                stepNumber={3}
                isCompleted={isPaymentMethodCompleted()}
                defaultOpen={!isPaymentMethodCompleted()}
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
                defaultOpen={!isVoucherCompleted()}
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
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Điểm thưởng"
                stepNumber={5}
                isCompleted={isRewardPointsCompleted()}
                defaultOpen={!isRewardPointsCompleted()}
              >
                <RewardPoints
                  availablePoints={rewardPointsData.available}
                  useRewardPoints={useRewardPoints}
                  setUseRewardPoints={setUseRewardPoints}
                  pointsToUse={pointsToUse}
                  setPointsToUse={setPointsToUse}
                  maxPointsToUse={rewardPointsData.maxPointsPerOrder}
                  openProfile={openProfile}
                  isLoggedIn={!!user}
                />
              </CollapsibleSection>
            </div>

            {/* Right column - Order summary */}
            <div className="col-span-4">
              <div className="bg-white p-4 rounded-lg sticky top-4">
                <ProductList
                  items={items}
                  loading={loading}
                  onUpdateQuantity={buyNowItem ? undefined : handleQuantityUpdate}
                  onRemoveItem={buyNowItem ? undefined : removeFromCart}
                  readOnly={!!buyNowItem}
                />
                <OrderSummary
                  items={items}
                  selectedVoucher={selectedVoucher}
                  pointsToUse={useRewardPoints ? pointsToUse : 0}
                  totalPrice={total}
                />
                <Button
                  variant="default"
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                >
                  {buyNowItem ? 'Mua ngay' : 'Đặt hàng'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Dialog */}
      <Dialog open={!!pdfPreviewUrl} onOpenChange={() => handleClosePdfPreview()}>
        <DialogContent className="w-[90vw] max-w-[90vw] h-[80vh] max-h-[80vh] p-0">
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <DialogTitle className="text-lg font-semibold">Xem trước PDF</DialogTitle>
            </div>
          </DialogHeader>
          <div className="h-full p-6 overflow-auto">
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
                      <Button
                        onClick={handlePreviewPDF}
                        variant="default"
                        className="flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Thử lại
                      </Button>
                      <Button
                        onClick={handleClosePdfPreview}
                        variant="outline"
                      >
                        Đóng
                      </Button>
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Drawer */}
      <ProfileDrawer isOpen={isProfileOpen} onClose={closeProfile} />
      
      {/* Validation Debugger */}
      <ValidationDebugger
        orderData={{
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
          cart_items: items,
          voucher: selectedVoucher,
          reward_points: useRewardPoints ? pointsToUse : 0,
          total_price: total,
          shipping_fee: shippingFee
        }}
      />
      
      {/* Replace ToastComponent with Toaster */}
      <Toaster />

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
