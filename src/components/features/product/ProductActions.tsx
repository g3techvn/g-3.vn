import React from 'react';
import { ShoppingCartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { COMPANY_INFO } from '@/constants';
import { ProductVariant } from '@/types';
import { Button } from '@/components/ui/Button';

interface ProductActionsProps {
  productPrice?: number;
  selectedVariant?: ProductVariant | null;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductActions({ productPrice, selectedVariant, onAddToCart, onBuyNow }: ProductActionsProps) {
  // Use variant price if available, otherwise fallback to product price
  const currentPrice = selectedVariant?.price ?? productPrice;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white border-t border-gray-200 flex gap-2 shadow-lg p-3">
      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center basis-1/4 h-14 text-red-600"
        onClick={() => window.open(COMPANY_INFO.zalo, '_blank')}
      >
        <ChatBubbleLeftIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Chat ngay</span>
      </Button>
      
      <div className="h-8 w-px bg-gray-300 self-center"></div>
      
      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center basis-1/4 h-14 text-red-600"
        onClick={onAddToCart}
      >
        <ShoppingCartIcon className="w-6 h-6" />
        <span className="text-xs mt-1">Thêm giỏ hàng</span>
      </Button>
      
      <Button
        className="flex-1 basis-2/4 h-14 text-base font-semibold flex flex-col items-center justify-center"
        onClick={onBuyNow}
      >
        <span>Mua với voucher</span>
        {currentPrice !== undefined && (
          <span className="text-sm font-medium">{currentPrice.toLocaleString('vi-VN')}₫</span>
        )}
      </Button>
    </div>
  );
} 