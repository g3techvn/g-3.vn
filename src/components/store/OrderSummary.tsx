'use client'

import { CartItem, Voucher } from '@/types/cart'

interface OrderSummaryProps {
  items: CartItem[];
  selectedVoucher: Voucher | null;
  pointsToUse: number;
  totalPrice: number;
}

export default function OrderSummary({
  items,
  selectedVoucher,
  pointsToUse,
  totalPrice
}: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const originalSubtotal = items.reduce((sum, item) => 
    sum + ((item.product.original_price || item.product.price) * item.quantity), 0)
  const totalSavings = originalSubtotal - subtotal
  const voucherDiscount = selectedVoucher ? selectedVoucher.discountAmount : 0
  const pointsDiscount = pointsToUse / 100 // Convert points to money
  const finalTotal = totalPrice - voucherDiscount - pointsDiscount

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Tổng đơn hàng</h3>
      
      <div className="space-y-2">
        {totalSavings > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 line-through">Tổng giá gốc:</span>
              <span className="text-gray-500 line-through">{originalSubtotal.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Tổng tiết kiệm:</span>
              <span className="text-green-600">{totalSavings.toLocaleString()}đ</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tạm tính:</span>
          <span className="text-gray-900">{subtotal.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Phí vận chuyển:</span>
          <span className="text-green-600">Miễn phí</span>
        </div>
        {selectedVoucher && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Giảm giá voucher:</span>
            <span className="text-green-600">-{voucherDiscount.toLocaleString()}đ</span>
          </div>
        )}
        {pointsToUse > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Điểm thưởng:</span>
            <span className="text-green-600">-{pointsToUse.toLocaleString()}đ</span>
          </div>
        )}
        <div className="border-t pt-2">
          <div className="flex justify-between">
            <span className="font-medium text-gray-900">Tổng cộng:</span>
            <span className="font-medium text-red-600">{finalTotal.toLocaleString()}đ</span>
          </div>
        </div>
      </div>
    </div>
  )
} 