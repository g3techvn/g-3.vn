'use client';

import { useState } from 'react';
import { Voucher } from '@/types/cart';
import { VoucherValidation } from '@/types/rewards';

interface VoucherInputProps {
  user: { id: string } | null;
  totalPrice: number;
  selectedVoucher: Voucher | null;
  onVoucherApplied: (voucher: Voucher | null) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export default function VoucherInput({
  user,
  totalPrice,
  selectedVoucher,
  onVoucherApplied,
  onError,
  onSuccess
}: VoucherInputProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      onError('Vui lòng nhập mã voucher');
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucher_code: voucherCode.trim().toUpperCase(),
          user_id: user?.id || null,
          order_total: totalPrice
        }),
      });

      const result: VoucherValidation = await response.json();

      if (result.valid && result.voucher) {
        // Convert to Voucher format
        const voucher: Voucher = {
          id: result.voucher.id,
          code: result.voucher.code,
          title: result.voucher.title,
          description: result.voucher.description,
          discountAmount: result.voucher.discountAmount,
          minOrderValue: result.voucher.minOrderValue,
          expiryDate: result.voucher.expiryDate
        };
        
        onVoucherApplied(voucher);
        onSuccess(result.message || 'Áp dụng voucher thành công!');
        setVoucherCode('');
      } else {
        onError(result.error || 'Voucher không hợp lệ');
      }
    } catch (error) {
      console.error('Error validating voucher:', error);
      onError('Có lỗi xảy ra khi kiểm tra voucher');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = () => {
    onVoucherApplied(null);
    onSuccess('Đã hủy áp dụng voucher');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidateVoucher();
    }
  };

  return (
    <div className="space-y-4">
      {/* Voucher Input */}
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium">Mã giảm giá</div>
          <div className="text-sm text-gray-500">
            Nhập mã voucher để được giảm giá
          </div>
        </div>
      </div>

      {/* Current Applied Voucher */}
      {selectedVoucher && (
        <div className="p-4 rounded-lg border border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-green-800">{selectedVoucher.title}</div>
              <div className="text-sm text-green-600">
                Mã: {selectedVoucher.code} • Giảm {selectedVoucher.discountAmount.toLocaleString()}đ
              </div>
              {selectedVoucher.description && (
                <div className="text-xs text-green-600 mt-1">
                  {selectedVoucher.description}
                </div>
              )}
            </div>
            <button
              onClick={handleRemoveVoucher}
              className="ml-3 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Voucher Input Form */}
      {!selectedVoucher && (
        <div className="flex gap-2">
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Nhập mã voucher"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={isValidating}
          />
          <button
            onClick={handleValidateVoucher}
            disabled={isValidating || !voucherCode.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kiểm tra...
              </div>
            ) : (
              'Áp dụng'
            )}
          </button>
        </div>
      )}

      {/* Voucher Tips */}
      {!selectedVoucher && (
        <div className="text-xs text-gray-500">
          💡 Mẹo: Voucher sẽ được áp dụng tự động nếu hợp lệ và phù hợp với đơn hàng
        </div>
      )}
    </div>
  );
} 