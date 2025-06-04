'use client'

import { useState } from 'react'
import { Modal, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useCart } from '@/context/CartContext'
import { Voucher } from '@/types/cart'

// Import components
import BuyerInfo from './BuyerInfo'
import ShippingInfo from './ShippingInfo'
import PaymentMethodSelection from './PaymentMethodSelection'
import OrderSummary from './OrderSummary'
import VoucherInfo from './VoucherInfo'
import RewardPoints from './RewardPoints'
import ProductList from './ProductList'

// Define types
interface FormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note: string;
  provinceCode: number;
  districtCode: number;
  wardCode: number;
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
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
    provinceCode: 0,
    districtCode: 0,
    wardCode: 0,
    paymentMethod: 'cod',
    voucher: '',
    rewardPoints: 0
  })

  // State for components
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false)
  const [showVoucherDrawer, setShowVoucherDrawer] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [useRewardPoints, setUseRewardPoints] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)

  // Mock data
  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng',
      icon: 'cod',
      description: 'Thanh toán tiền mặt khi nhận hàng'
    },
    {
      id: 'bank',
      name: 'Chuyển khoản ngân hàng',
      icon: 'bank',
      description: 'Chuyển khoản qua tài khoản ngân hàng'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      icon: 'momo',
      description: 'Thanh toán qua ví MoMo'
    }
  ]

  const availableVouchers: Voucher[] = [
    {
      id: '1',
      code: 'WELCOME10',
      title: 'Giảm 10% cho đơn hàng đầu tiên',
      description: 'Áp dụng cho đơn hàng đầu tiên',
      discountAmount: 100000,
      minOrderValue: 500000,
      expiryDate: new Date('2024-12-31').toISOString()
    }
  ]

  const rewardPointsData = {
    available: 1000,
    pointValue: 1000,
    minPointsToRedeem: 100,
    maxPointsPerOrder: 500
  }

  // Form validation
  const isFormValid = () => {
    return !!(formData.fullName && formData.phone && formData.address && 
              formData.provinceCode && formData.districtCode && formData.wardCode &&
              formData.paymentMethod)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    console.log('Checkout data:', formData)
    alert('Đặt hàng thành công!')
    closeAll()
  }

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Early return if not open
  if (!isOpen) return null

  return (
    <Modal
      title={
        <div className="flex w-full justify-between items-center">
          <h2 className="text-xl font-semibold">Thanh toán</h2>
          <button
            onClick={closeAll}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      }
      open={isOpen}
      onCancel={closeAll}
      width={1200}
      className="checkout-modal"
      mask={true}
      maskClosable={false}
      footer={null}
      styles={{
        body: {
          paddingBottom: 80,
          overflow: 'auto',
          padding: '0 16px'
        },
        header: {
          padding: '16px 24px'
        },
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
      }}
    >
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10">
          <div className="flex flex-col items-center">
            <LoadingOutlined style={{ fontSize: 24, color: '#dc3545', marginBottom: 8 }} />
            <span className="text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Left column - Form sections */}
        <div className="col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-lg">
            <BuyerInfo 
              user={null}
              guestInfo={{
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email
              }}
              setGuestInfo={(info) => {
                if (typeof info === 'function') {
                  const newInfo = info({
                    fullName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email
                  })
                  handleFormChange('fullName', newInfo.fullName)
                  handleFormChange('phone', newInfo.phone)
                  handleFormChange('email', newInfo.email)
                } else {
                  handleFormChange('fullName', info.fullName)
                  handleFormChange('phone', info.phone)
                  handleFormChange('email', info.email)
                }
              }}
              userPhone={formData.phone}
              setUserPhone={(phone) => handleFormChange('phone', phone)}
              errors={{ fullName: '', phone: '' }}
              setErrors={() => {}}
            />
          </div>

          <div className="bg-white p-4 rounded-lg">
            <ShippingInfo 
              addressForm={{
                city: formData.city,
                district: formData.district,
                ward: formData.ward,
                address: formData.address
              }}
              setAddressForm={(info) => {
                if (typeof info === 'function') {
                  const newInfo = info({
                    city: formData.city,
                    district: formData.district,
                    ward: formData.ward,
                    address: formData.address
                  })
                  handleFormChange('city', newInfo.city)
                  handleFormChange('district', newInfo.district)
                  handleFormChange('ward', newInfo.ward)
                  handleFormChange('address', newInfo.address)
                } else {
                  handleFormChange('city', info.city)
                  handleFormChange('district', info.district)
                  handleFormChange('ward', info.ward)
                  handleFormChange('address', info.address)
                }
              }}
              selectedCarrier=""
              setSelectedCarrier={() => {}}
              carriers={[]}
              cities={[]}
              districts={[]}
              wards={[]}
              loadingCities={false}
              loadingDistricts={false}
              loadingWards={false}
              showAddressDrawer={false}
              setShowAddressDrawer={() => {}}
              showShippingDrawer={false}
              setShowShippingDrawer={() => {}}
              fetchDistricts={async () => {}}
              fetchWards={async () => {}}
              note={formData.note}
              setNote={(note) => handleFormChange('note', note)}
            />
          </div>

          <div className="bg-white p-4 rounded-lg">
            <PaymentMethodSelection 
              showPaymentDrawer={showPaymentDrawer}
              setShowPaymentDrawer={setShowPaymentDrawer}
              selectedPayment={formData.paymentMethod}
              setSelectedPayment={(method) => handleFormChange('paymentMethod', method)}
              paymentMethods={paymentMethods}
            />
          </div>

          <div className="bg-white p-4 rounded-lg">
            <VoucherInfo 
              showVoucherDrawer={showVoucherDrawer}
              setShowVoucherDrawer={setShowVoucherDrawer}
              voucherCode={formData.voucher}
              setVoucherCode={(code) => handleFormChange('voucher', code)}
              selectedVoucher={selectedVoucher}
              setSelectedVoucher={setSelectedVoucher}
              availableVouchers={availableVouchers}
              totalPrice={totalPrice}
            />
          </div>

          <div className="bg-white p-4 rounded-lg">
            <RewardPoints 
              isLoggedIn={true}
              availablePoints={rewardPointsData.available}
              useRewardPoints={useRewardPoints}
              setUseRewardPoints={setUseRewardPoints}
              pointsToUse={pointsToUse}
              setPointsToUse={setPointsToUse}
              maxPointsToUse={rewardPointsData.maxPointsPerOrder}
            />
          </div>
        </div>

        {/* Right column - Order summary */}
        <div className="col-span-4">
          <div className="sticky top-4">
            <div className="bg-white p-4 rounded-lg mb-4">
              <ProductList 
                loading={loading}
                items={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
              />
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <OrderSummary 
                items={cartItems}
                totalPrice={totalPrice}
                shippingFee={30000}
                selectedVoucher={selectedVoucher}
                pointsToUse={pointsToUse * rewardPointsData.pointValue}
              />
              
              <div className="mt-4">
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  style={{ 
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545',
                    height: '48px',
                    fontSize: '16px'
                  }}
                >
                  Đặt hàng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
