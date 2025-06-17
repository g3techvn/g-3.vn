'use client';

import { Voucher } from '@/types/cart';

interface OrderSummaryProps {
  totalPrice: number;
  selectedVoucher: Voucher | null;
  pointsDiscount: number;
}

export default function OrderSummary({
  totalPrice,
  selectedVoucher,
  pointsDiscount
}: OrderSummaryProps) {
  return (
    <div className="py-2">
      {/* Total Product Price */}
      <div className="flex py-3 border-b border-gray-100">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-red-600 font-medium ">{totalPrice.toLocaleString()}đ</div>
          <div className="text-gray-500 text-sm mt-1">Tổng tiền hàng</div>
        </div>
      </div>
      
      {/* Shipping Fee */}
      <div className="flex py-3 border-b border-gray-100">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
              <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div>
            <div className="text-green-600 font-medium">Miễn phí</div>
            <div className="text-gray-500 text-sm mt-1">Phí vận chuyển</div>
          </div>
          <div className="text-green-600 text-sm mt-1">Freeship toàn quốc</div>
          <div className="mt-2 inline-block border border-green-500 text-green-600 text-left rounded-md text-sm px-2 py-1">
            Nội thành HN, HCM trong ngày, liên tỉnh 2-3 ngày
          </div>
        </div>
      </div>

      {/* Voucher Discount */}
      <div className="flex py-3 border-b border-gray-100">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-red-600 font-medium">{((selectedVoucher?.discountAmount || 0) + pointsDiscount).toLocaleString()}đ</div>
          <div className="text-gray-500 text-sm mt-1">Tổng cộng giảm giá</div>
          {selectedVoucher && (
            <div className="text-gray-500 text-sm">Voucher: -{selectedVoucher.discountAmount.toLocaleString()}đ</div>
          )}
          {pointsDiscount > 0 && (
            <div className="text-gray-500 text-sm">Điểm thưởng: -{pointsDiscount.toLocaleString()}đ</div>
          )}
        </div>
      </div>
    </div>
  );
} 