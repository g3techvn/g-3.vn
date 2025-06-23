import React from 'react';
import { ProductVariant } from '@/types';

interface ProductPriceProps {
  price: number | undefined;
  originalPrice?: number;
  publisher?: string;
  soldCount?: number;
  selectedVariant?: ProductVariant | null;
  productId?: string;
}

const ProductPrice: React.FC<ProductPriceProps> = ({
  price,
  originalPrice,
  publisher,
  soldCount = 0,
  selectedVariant,
  productId
}) => {
  // Calculate discount percentage
  const discountPercentage = originalPrice && price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-red-600">
            {price ? price.toLocaleString() : 0}đ
          </span>
          {originalPrice && originalPrice > (price || 0) && (
            <span className="text-sm text-gray-500 line-through">
              {originalPrice.toLocaleString()}đ
            </span>
          )}
        </div>
        {discountPercentage > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
            -{discountPercentage}%
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6" />
            </svg>
            4.9
          </span>
          <span>•</span>
          <span>Đã bán {soldCount}</span>
        </div>
        {publisher && (
          <div className="text-gray-600">
            Cung cấp bởi <span className="font-medium">{publisher}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPrice; 