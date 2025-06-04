'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Link href={`/san-pham/${product.slug || product.id}`} className={`block ${className}`}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="aspect-square w-full">
          <Image
            src={product.image_url}
            alt={product.name}
            width={300}
            height={300}
            className="object-contain w-full h-full"
          />
        </div>
        <div className="flex-1 flex flex-col px-2 pt-2 pb-1">
          <div className="h-10 font-medium text-sm text-gray-900 line-clamp-2 mb-1">{product.name}</div>
          <div className="flex items-end gap-2 mb-1 mt-auto">
            <span className="text-red-600 font-bold text-base">{product.price.toLocaleString()}₫</span>
            {product.original_price && (
              <span className="text-xs text-gray-400 line-through">{product.original_price.toLocaleString()}₫</span>
            )}
          </div>
          {/* Đánh giá, đã bán và nút thêm giỏ hàng */}
          <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5">
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 "/></svg>
                {(product.rating || 4.9).toFixed(1)}
              </span>
              <span>•</span>
              <span>Đã bán {Math.floor(Math.random()*100+1)}</span>
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
      </div>
    </Link>
  );
} 