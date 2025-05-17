import React from 'react';
import { ShoppingCartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { COMPANY_INFO } from '@/constants';

interface ProductActionsProps {
  productPrice?: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductActions({ productPrice, onAddToCart, onBuyNow }: ProductActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-60 bg-white border-t border-gray-200 flex gap-2 shadow-lg p-3">
      <button
        className="flex flex-col items-center justify-center basis-1/4 h-14 text-red-600 rounded-xl hover:bg-gray-50 transition-colors"
        onClick={() => window.open(COMPANY_INFO.zalo, '_blank')}
      >
        <ChatBubbleLeftIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Chat ngay</span>
      </button>
      
      <div className="h-8 w-px bg-gray-300 self-center"></div>
      
      <button
        className="flex flex-col items-center justify-center basis-1/4 h-14 text-red-600 rounded-xl hover:bg-gray-50 transition-colors"
        onClick={onAddToCart}
      >
        <ShoppingCartIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Thêm giỏ hàng</span>
      </button>
      
      <button
        className="flex-1 basis-2/4 bg-red-600 text-white h-14 text-base font-semibold shadow hover:bg-red-700 transition-colors rounded-lg flex flex-col items-center justify-center"
        onClick={onBuyNow}
      >
        <span>Mua với voucher</span>
        {productPrice !== undefined && (
          <span className="text-sm font-medium">{productPrice.toLocaleString('vi-VN')}₫</span>
        )}
      </button>
    </div>
  );
} 