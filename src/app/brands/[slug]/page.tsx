'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import BrandShopeeHeader from '@/components/mobile/BrandShopeeHeader';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';

// Fix linter: declare YT types for YouTube Player API
declare global {
  interface Window {
    YT: {
      Player: new (element: HTMLElement, options: {
        events: {
          onReady: (event: YTPlayerEvent) => void;
          onStateChange: (event: YTOnStateChangeEvent) => void;
        };
      }) => YTPlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayerEvent {
  target: { mute: () => void; playVideo: () => void };
}

interface YTOnStateChangeEvent {
  data: number;
}

interface YTPlayer {
  destroy(): void;
}

export default function BrandProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/brands/${slug}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const productsData = data.products || [];
        setProducts(productsData);
        
        // Lấy tên brand từ sản phẩm đầu tiên
        if (productsData.length > 0) {
          setBrandName(productsData[0].brand || '');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-1/4 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full rounded-lg bg-gray-200" />
                <div className="mt-2 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
            </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Shopee Header */}
      <div className="md:hidden">
        <BrandShopeeHeader 
          brandName={brandName || 'Tên thương hiệu'} 
          products={products}
        />
      </div>
      {/* Desktop/main content */}
      <div className="container mx-auto">
        <div className="hidden md:block">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Thương hiệu', href: '/brands' },
              { label: brandName }
            ]}
          />
        </div>

        <div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-4 px-2 sm:px-4 md:px-6">
              {products.map((product) => (
                <Link key={product.id} href={`/san-pham/${product.slug || product.id}`} className="block">
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
                          onClick={() => addToCart(product)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <p className="text-lg text-gray-600">Không tìm thấy sản phẩm nào.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 