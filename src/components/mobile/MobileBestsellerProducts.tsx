import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { StarIcon } from '@radix-ui/react-icons';

// Random banner images from Unsplash
const bannerImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&auto=format', // Furniture
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&auto=format', // Office
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=1200&auto=format', // Workspace
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format', // Modern
  'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=1200&auto=format', // Minimal
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format', // Tech
];

const MobileBestsellerProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`Lỗi HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error: unknown) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Function to get random banner image
  const getRandomBanner = () => {
    return bannerImages[Math.floor(Math.random() * bannerImages.length)];
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const slideWidth = container.offsetWidth * 0.95; // 95% of container width
      const scrollPosition = container.scrollLeft;
      const newSlide = Math.round(scrollPosition / slideWidth);
      setCurrentSlide(newSlide);
    }
  };

  return (
    <section className="pt-4">
      <div className="flex items-center justify-between px-4 mb-2">
        <h2 className="text-lg font-semibold text-red-700">Sản phẩm bán chạy</h2>
        <div className="flex gap-1">
          {products.slice(0, 4).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-red-500 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
          Đã xảy ra lỗi: {error}
        </div>
      )}
      {loading ? (
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
      ) : products.length > 0 ? (
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto flex-nowrap snap-x snap-mandatory px-4 pb-8 scrollbar-hide"
          >
            {products.slice(0, 4).map((product) => (
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
                <div className="bg-white rounded-lg shadow overflow-hidden">
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
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-600">
                              {product.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-base text-gray-600">Không tìm thấy sản phẩm nào.</p>
          <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau.</p>
        </div>
      )}
    </section>
  );
};

export default MobileBestsellerProducts; 