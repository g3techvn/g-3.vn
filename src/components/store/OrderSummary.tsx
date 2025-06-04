'use client'

import { CartItem, Voucher } from '@/types/cart'

interface OrderSummaryProps {
  items: CartItem[];
  shippingFee: number;
  selectedVoucher: Voucher | null;
  pointsToUse: number;
  totalPrice: number;
}

export default function OrderSummary({
  items,
  shippingFee,
  selectedVoucher,
  pointsToUse,
  totalPrice
}: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const voucherDiscount = selectedVoucher?.discountAmount || 0
  const pointsDiscount = pointsToUse / 100 // Convert points to money
  const finalTotal = totalPrice + shippingFee - voucherDiscount - pointsDiscount

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Tổng đơn hàng</h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tạm tính</span>
          <span className="text-gray-900">{subtotal.toLocaleString()}đ</span>
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Phí vận chuyển</span>
          <span className="text-gray-900">{shippingFee.toLocaleString()}đ</span>
        </div>

        {/* Voucher Discount */}
        {selectedVoucher && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Giảm giá voucher</span>
            <span className="text-red-600">-{voucherDiscount.toLocaleString()}đ</span>
          </div>
        )}

        {/* Points Discount */}
        {pointsToUse > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Giảm giá điểm thưởng</span>
            <span className="text-red-600">-{pointsDiscount.toLocaleString()}đ</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-3" />

        {/* Final Total */}
        <div className="flex justify-between text-base font-medium">
          <span className="text-gray-900">Tổng cộng</span>
          <span className="text-red-600">{finalTotal.toLocaleString()}đ</span>
        </div>

        {/* Note */}
        <div className="text-sm text-gray-500 mt-4">
          <p>* Giá đã bao gồm VAT</p>
          <p>* Phí vận chuyển có thể thay đổi tùy theo địa chỉ giao hàng</p>
        </div>
      </div>
    </div>
  )
} 