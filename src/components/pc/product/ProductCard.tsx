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

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [brandImage, setBrandImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // ✅ Use cached brand data instead of manual fetch
  const { data: brandData, isLoading: brandLoading } = useBrandData(product.brand_id);
  
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

  return (
    <>
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden ${className}`}>
        <div 
          className="aspect-square w-full relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {product.original_price && product.original_price > product.price && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg z-10">
              -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
            </div>
          )}
          {brandImage && !imageError && (
            <div className="absolute top-2 right-2 bg-white rounded-lg shadow-md z-10">
              <Image
                src={brandImage}
                alt={(typeof product.brand === 'string' ? product.brand : product.brand?.title) || ''}
                width={24}
                height={24}
                className="w-6 h-6 object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          <div 
            className={`absolute inset-0 backdrop-blur-[2px] bg-black/20 flex items-center justify-center transition-all duration-300 z-10 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button 
              onClick={handleQuickView}
              className="transform transition-all duration-300 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white hover:scale-110 hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </div>
          <Link href={`/san-pham/${product.slug || product.id}`}>
            <OptimizedImage
              src={product.image_url}
              alt={product.name}
              width={300}
              height={300}
              className="object-contain w-full h-full cursor-pointer"
              productName={product.name}
              category={product.category_name}
              brand={typeof product.brand === 'string' ? product.brand : product.brand?.title}
              priority={false}
            />
          </Link>
        </div>
        <Link href={`/san-pham/${product.slug || product.id}`} className="block">
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
                <span>Đã bán {product.sold_count || 0}</span>
              </div>
              <button 
                className="p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors duration-200"
                aria-label="Thêm vào giỏ hàng"
                onClick={(e) => {
                  e.preventDefault();
                  const cartItem = {
                    ...product,
                    quantity: 1,
                    image: product.image_url || ''
                  };
                  addToCart(cartItem);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
        </Link>
      </div>
      <QuickView 
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
} 