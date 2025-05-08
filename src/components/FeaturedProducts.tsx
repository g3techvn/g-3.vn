import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';

interface FeaturedProduct {
  id: number;
  name: string;
  category: string;
  image: string;
  url: string;
}

// Sample data
const sampleProducts: FeaturedProduct[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    category: "Điện thoại",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569",
    url: "/products/iphone-15-pro-max"
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    category: "Laptop",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
    url: "/products/macbook-pro-m3"
  },
  {
    id: 3,
    name: "iPad Pro 12.9",
    category: "Máy tính bảng",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
    url: "/products/ipad-pro"
  },
  {
    id: 4,
    name: "AirPods Pro 2",
    category: "Phụ kiện",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434",
    url: "/products/airpods-pro-2"
  },
  {
    id: 5,
    name: "Apple Watch Series 9",
    category: "Đồng hồ thông minh",
    image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
    url: "/products/apple-watch-series-9"
  },
  {
    id: 6,
    name: "HomePod mini",
    category: "Loa thông minh",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
    url: "/products/homepod-mini"
  },
  {
    id: 7,
    name: "Magic Keyboard",
    category: "Phụ kiện",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef",
    url: "/products/magic-keyboard"
  },
  {
    id: 8,
    name: "Apple TV 4K",
    category: "TV Box",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
    url: "/products/apple-tv-4k"
  }
];

export default function FeaturedProducts({ 
  autoSlideInterval = 5000 // Default 5 seconds
}: { autoSlideInterval?: number }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  // Hiển thị 4 sản phẩm mỗi slide trên màn hình lớn, 2 trên màn hình vừa và 1 trên màn hình nhỏ
  const totalSlides = Math.ceil(sampleProducts.length / 4);
  
  const nextSlide = useCallback(() => {
    const newSlide = (currentSlide + 1) % totalSlides;
    setCurrentSlide(newSlide);
  }, [currentSlide, totalSlides]);
  
  const prevSlide = () => {
    const newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    setCurrentSlide(newSlide);
  };

  const handleImageError = (productId: number) => {
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
    products: sampleProducts.slice(index * 4, index * 4 + 4)
  }));

  // Ensure we have a valid current slide value
  const currentTabValue = `slide-${currentSlide}`;

  return (
    <section className="py-10 bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-8">Sản phẩm nổi bật</h2>
        
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
            {slides.map((slide) => (
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
                    <Link key={product.id} href={product.url} className="block">
                      <div className="bg-white overflow-hidden rounded-lg shadow-md transition-all hover:shadow-lg">
                        <div className="relative h-64 overflow-hidden">
                          {imageError[product.id] ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <div className="text-center p-4">
                                <div className="text-2xl font-bold mb-2">{product.name}</div>
                                <div className="text-sm text-gray-600">{product.category}</div>
                              </div>
                            </div>
                          ) : (
                            <AspectRatio.Root ratio={1} className="h-full">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                onError={() => handleImageError(product.id)}
                                priority={currentSlide === 0}
                              />
                            </AspectRatio.Root>
                          )}
                        </div>
                        <div className="p-4 text-center">
                          <div className="text-sm text-gray-500 mb-1">{product.category}</div>
                          <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                          <div>
                            <span className="inline-block text-xs font-medium bg-white border border-gray-300 rounded-full py-1 px-3 text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:shadow-md">
                              XEM NGAY
                              <ChevronRightIcon className="inline-block ml-1 w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            ))}
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