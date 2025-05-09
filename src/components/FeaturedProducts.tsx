import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

const MAX_PRODUCTS = 8;

export default function FeaturedProducts({ 
  autoSlideInterval = 5000 // Default 5 seconds
}: { autoSlideInterval?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?sort=featured:desc&limit=${MAX_PRODUCTS}`);
        
        if (!response.ok) {
          throw new Error(`Lỗi HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setProducts((data.products || []).slice(0, MAX_PRODUCTS));
      } catch (error: unknown) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Hiển thị 4 sản phẩm mỗi slide trên màn hình lớn, 2 trên màn hình vừa và 1 trên màn hình nhỏ
  const totalSlides = Math.ceil(products.length / 4);
  
  const nextSlide = useCallback(() => {
    const newSlide = (currentSlide + 1) % totalSlides;
    setCurrentSlide(newSlide);
  }, [currentSlide, totalSlides]);
  
  const prevSlide = () => {
    const newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    setCurrentSlide(newSlide);
  };

  const handleImageError = (productId: string) => {
    setImageError(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  // Auto slide functionality
  useEffect(() => {
    if (!isPaused && autoSlideInterval > 0) {
      timerRef.current = setTimeout(() => {
        nextSlide();
      }, autoSlideInterval);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentSlide, isPaused, autoSlideInterval, nextSlide]);

  // Pause auto slide when hovering over the carousel
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Prepare slides for tabs
  const slides = Array.from({ length: totalSlides }).map((_, index) => ({
    id: `slide-${index}`,
    products: products.slice(index * 4, index * 4 + 4)
  }));

  // Ensure we have a valid current slide value
  const currentTabValue = `slide-${currentSlide}`;

  return (
    <section className="py-10 bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-8">Sản phẩm nổi bật</h2>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
            Đã xảy ra lỗi: {error}
          </div>
        )}

        <Tabs
          value={currentTabValue}
          onValueChange={(value) => {
            const slideIndex = parseInt(value.split('-')[1]);
            setCurrentSlide(slideIndex);
          }}
          className="relative"
        >
          {/* Navigation buttons */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-10 flex justify-between pointer-events-none">
            <button 
              onClick={(e) => {
                e.preventDefault();
                prevSlide();
              }}
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 pointer-events-auto transition-transform duration-300 hover:scale-110"
              aria-label="Previous slide"
              type="button"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                nextSlide();
              }}
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 pointer-events-auto transition-transform duration-300 hover:scale-110"
              aria-label="Next slide"
              type="button"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* TabsList for accessibility and proper Radix UI tabs function */}
          <TabsList className="sr-only">
            {slides.map((slide) => (
              <TabsTrigger key={slide.id} value={slide.id}>
                {`Slide ${slide.id}`}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Products carousel */}
          <div 
            className="overflow-hidden"
            ref={slideContainerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square w-full rounded-lg bg-gray-200" />
                    <div className="mt-2 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-4 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              slides.map((slide) => (
                <TabsContent 
                  key={slide.id} 
                  value={slide.id}
                  className="m-0 transition-all duration-500 transform"
                  style={{
                    opacity: currentTabValue === slide.id ? 1 : 0,
                    transform: `translateX(${(parseInt(slide.id.split('-')[1]) - currentSlide) * 100}%)`,
                    position: 'relative',
                    zIndex: currentTabValue === slide.id ? 1 : 0,
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {slide.products.map((product) => (
                      <div key={product.id} className="block">
                        <div className="bg-white overflow-hidden rounded-lg shadow-md">
                          <AspectRatio.Root ratio={1}>
                            <div className="relative w-full h-full">
                              {imageError[product.id] ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <div className="text-center p-4">
                                    <div className="text-2xl font-bold mb-2">{product.name}</div>
                                    <div className="text-sm text-gray-600">{product.brand || 'Không rõ'}</div>
                                  </div>
                                </div>
                              ) : (
                                <Image
                                  src={product.image_url || ''}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                  onError={() => handleImageError(product.id)}
                                  priority={currentSlide === 0}
                                />
                              )}
                            </div>
                          </AspectRatio.Root>
                          <div className="p-4">
                            <div className="text-sm text-gray-500 mb-1">{product.brand || 'Không rõ'}</div>
                            <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                            <div className="flex items-center justify-between mt-2">
                              <div>
                                {product.original_price ? (
                                  <>
                                    <span className="text-gray-500 line-through text-xs block">
                                      {product.original_price.toLocaleString()}₫
                                    </span>
                                    <span className="text-red-600 font-bold text-sm">
                                      {product.price.toLocaleString()}₫
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-red-600 font-bold text-sm">
                                    {product.price.toLocaleString()}₫
                                  </span>
                                )}
                              </div>
                              <button 
                                className="p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors duration-200"
                                aria-label="Thêm vào giỏ hàng"
                                onClick={(e) => {
                                  e.preventDefault();
                                  addToCart(product);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-base text-gray-600">Không tìm thấy sản phẩm nổi bật nào.</p>
                <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau.</p>
              </div>
            )}
          </div>
          
          {/* Slide indicators */}
          <div className="flex justify-center space-x-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'w-8 bg-gray-500' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide ? 'true' : 'false'}
              />
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
} 