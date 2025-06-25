import React from 'react';
import { formatCurrency } from '@/utils/helpers';

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  total_price: number;
  product_image?: string;
}

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderValue: number;
  expiryDate: string;
}

interface OrderSummaryProps {
  items: OrderItem[];
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
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const voucherDiscount = selectedVoucher?.discountAmount || 0;
  const pointsDiscount = pointsToUse * 1000; // Giả sử 1 điểm = 1000đ
  const total = subtotal - voucherDiscount - pointsDiscount;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Tổng đơn hàng</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {selectedVoucher && (
          <div className="flex justify-between text-green-600">
            <span>Voucher giảm giá</span>
            <span>-{formatCurrency(voucherDiscount)}</span>
          </div>
        )}
        
        {pointsToUse > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Điểm thưởng ({pointsToUse} điểm)</span>
            <span>-{formatCurrency(pointsDiscount)}</span>
          </div>
        )}
        
        <div className="border-t pt-2 font-medium">
          <div className="flex justify-between">
            <span>Tổng cộng</span>
            <span className="text-red-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 