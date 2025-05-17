import React from 'react';

interface ProductPriceProps {
  price: number | undefined;
  originalPrice?: number;
  publisher?: string;
  soldCount?: number;
}

export function ProductPrice({ price, originalPrice, publisher, soldCount = 114 }: ProductPriceProps) {
  return (
    <div className="bg-white px-4 pt-2 pb-3 border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-red-600">{price?.toLocaleString('vi-VN')}₫</div>
          {originalPrice && (
            <div className="text-base text-gray-400 line-through">{originalPrice.toLocaleString('vi-VN')}₫</div>
          )}
        </div>
        <div className="text-xs text-gray-500">Đã bán {soldCount}</div>
      </div>
      
      {/* Brand display */}
      {publisher && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-600">Thương hiệu:</span>
          <span className="text-sm font-medium text-gray-800">{publisher}</span>
        </div>
      )}
    </div>
  );
} 