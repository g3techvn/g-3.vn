import React, { useState, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { StarIcon } from '@radix-ui/react-icons';
import { useCart } from '@/context/CartContext';

// Random banner images from Unsplash
const bannerImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format', // Furniture
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format', // Office
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=1200&auto=format', // Workspace
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format', // Modern
  'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=1200&auto=format', // Minimal
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format', // Tech
];

interface MobileBestsellerProductsProps {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const MobileBestsellerProducts: React.FC<MobileBestsellerProductsProps> = React.memo(({ 
  products,
  loading,
  error
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  // Function to get random banner image - memoized for each product
  const getRandomBanner = useCallback(() => {
    return bannerImages[Math.floor(Math.random() * bannerImages.length)];
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const slideWidth = container.offsetWidth * 0.95; // 95% of container width
      const scrollPosition = container.scrollLeft;
      const newSlide = Math.round(scrollPosition / slideWidth);
      setCurrentSlide(newSlide);
    }
  }, []);

  const handleAddToCart = useCallback((e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  }, [addToCart]);

  // Lấy tối đa 4 sản phẩm để hiển thị và sắp xếp theo rating - memoized
  const displayProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [products]);

  // Loading state
  if (loading) {
    return (
      <section className="pt-4">
        <div className="flex items-center justify-between px-4 mb-2">
          <h2 className="text-lg font-semibold text-red-700">Sản phẩm bán chạy</h2>
          <div className="flex gap-1">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-gray-300"
              />
            ))}
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto flex-nowrap snap-x snap-mandatory px-4 pb-4 scrollbar-hide">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[95%] min-w-[320px] mx-auto space-y-3 snap-center">
              <div className="w-full aspect-video bg-gray-200 animate-pulse rounded-lg" />
              <div className="bg-white rounded-lg shadow p-2">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-20 rounded-md bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                    <div className="h-3 w-1/4 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="pt-4">
        <div className="flex items-center justify-between px-4 mb-2">
          <h2 className="text-lg font-semibold text-red-700">Sản phẩm bán chạy</h2>
        </div>
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
          Đã xảy ra lỗi: {error}
        </div>
      </section>
    );
  }

  // Empty state
  if (displayProducts.length === 0) {
    return (
      <section className="pt-4">
        <div className="flex items-center justify-between px-4 mb-2">
          <h2 className="text-lg font-semibold text-red-700">Sản phẩm bán chạy</h2>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-base text-gray-600">Không tìm thấy sản phẩm nào.</p>
          <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-4">
      <div className="flex items-center justify-between px-4 mb-2">
        <h2 className="text-lg font-semibold text-red-700">Sản phẩm bán chạy</h2>
        <div className="flex gap-1">
          {displayProducts.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-red-500 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto flex-nowrap snap-x snap-mandatory px-4 pb-8 scrollbar-hide"
        >
          {displayProducts.map((product) => (
            <div key={product.id} className="w-[95%] min-w-[320px] mx-auto space-y-3 snap-center">
              <div className="relative w-full aspect-video">
                <Image
                  src={getRandomBanner()}
                  alt={`Banner ${product.name}`}
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
              <Link 
                href={`/san-pham/${product.slug || product.id}`}
                className="bg-white rounded-lg shadow overflow-hidden block"
              >
                <div className="flex items-center p-2">
                  <div className="relative w-20 h-20">
                    <Image
                      src={product.image_url || "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200&auto=format"}
                      alt={product.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 ml-2">
                    <div className="font-medium text-sm line-clamp-2">
                      {product.name}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-500 font-semibold">
                          {formatCurrency(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatCurrency(product.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
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
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Add display name for debugging
MobileBestsellerProducts.displayName = 'MobileBestsellerProducts';

export default MobileBestsellerProducts; 