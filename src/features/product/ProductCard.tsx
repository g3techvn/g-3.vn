import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/utils/helpers';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, image_url, original_price, discount_percentage, brand_id, brand, rating } = product;
  
  const hasDiscount = original_price && original_price > price;
  const displayRating = rating || Math.floor(Math.random() * 5) + 1; // Sử dụng rating từ API hoặc tạo giá trị ngẫu nhiên
  const displayBrand = brand || brand_id || 'Unknown';

  return (
    <div className="group relative overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden">
          {hasDiscount && discount_percentage && (
            <div className="absolute top-2 left-2 z-10 rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white">
              -{discount_percentage}%
            </div>
          )}
          <Image
            src={image_url || '/placeholder-product.jpg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-500 mb-1">{displayBrand}</div>
          
          <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2 h-[2.5rem] group-hover:text-red-600">
            {name}
          </h3>
          
          {/* Rating stars */}
          <div className="flex items-center mb-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={i < displayRating ? "#FFD700" : "none"}
                stroke={i < displayRating ? "#FFD700" : "currentColor"}
                className="h-3 w-3 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
          </div>
          
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-gray-500 line-through text-xs">
                  {formatCurrency(original_price)}
                </span>
                <span className="text-red-600 font-bold text-sm">
                  {formatCurrency(price)}
                </span>
              </>
            ) : (
              <span className="text-red-600 font-bold text-sm">
                {formatCurrency(price)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute bottom-3 right-3 translate-y-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <button
          className="rounded-full bg-primary p-2 text-white shadow-md hover:bg-primary/90"
          aria-label="Add to cart"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </button>
      </div>
    </div>
  );
} 