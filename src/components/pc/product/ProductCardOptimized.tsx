'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import QuickView from './QuickView';
import OptimizedImage from '@/components/common/OptimizedImage';
import { useBrandData } from '@/hooks/useBrandData';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCardOptimized({ product, className = '' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [brandImage, setBrandImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  const { data: brandData } = useBrandData(product.brand_id);
  
  // Update brandImage when cached data changes
  useEffect(() => {
    if (brandData) {
      const imageUrl = brandData.image_square_url || brandData.image_url;
      if (imageUrl) {
        setBrandImage(imageUrl);
        setImageError(false);
      } else {
        setImageError(true);
      }
    }
  }, [brandData]);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      quantity: 1,
      image: product.image_url || ''
    });
  };

  return (
    <div className={`group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <Link href={`/san-pham/${product.slug || product.id}`} className="block">
        <div
          className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-square overflow-hidden">
            <OptimizedImage
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              quality={85}
            />
            
            {isHovered && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <button
                  onClick={handleQuickView}
                  className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Xem nhanh
                </button>
              </div>
            )}
            
            {brandImage && !imageError && (
              <div className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full p-1 shadow-sm">
                <Image
                  src={brandImage}
                  alt="Brand"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col px-2 pt-2 pb-1">
            <div className="h-10 font-medium text-sm text-gray-900 line-clamp-2 mb-1">{product.name}</div>
            <div className="flex items-end gap-2 mb-1 mt-auto">
              <span className="text-red-600 font-bold text-base">{product.price.toLocaleString()}₫</span>
              {product.original_price && (
                <span className="text-xs text-gray-400 line-through">{product.original_price.toLocaleString()}₫</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 "/></svg>
                  {(product.rating || 4.9).toFixed(1)}
                </span>
                <span>•</span>
                <span>
                  Đã bán {product.sold_count || 0}
                  <span className="ml-1 text-green-600 text-xs">⚡</span>
                </span>
              </div>
              <button
                onClick={handleAddToCart}
                className="absolute right-2 bottom-2 p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors duration-200"
                aria-label="Thêm vào giỏ hàng"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Link>

      {isQuickViewOpen && (
        <QuickView
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </div>
  );
} 