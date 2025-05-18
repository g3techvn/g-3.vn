import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Product, Brand } from '@/types';
import { ProductCard } from '@/features/product/ProductCard';
import { motion, useInView } from 'framer-motion';

const MAX_PRODUCTS = 8;

export default function FeaturedProducts({ 
  autoSlideInterval = 5000, // Default 5 seconds
  products = [],
  loading = false,
  error = null,
  brands = []
}: { 
  autoSlideInterval?: number;
  products: Product[];
  loading: boolean;
  error: string | null;
  brands?: Brand[];
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-10%" });
  
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

  // Prepare slides for tabs - create array of slides with products
  const slides = Array.from({ length: totalSlides }).map((_, index) => ({
    id: `slide-${index}`,
    products: products.slice(index * 4, index * 4 + 4)
  }));

  // Ensure we have a valid current slide value
  const currentTabValue = `slide-${currentSlide}`;

  // Only preload the current and next slide
  const slidesToPreload = [
    currentSlide,
    (currentSlide + 1) % totalSlides
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  return (
    <motion.section 
      className="py-10 bg-gray-100 border-t border-gray-200 scroll-trigger"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      ref={sectionRef}
    >
      <div className="container mx-auto">
        <motion.h2 
          className="text-2xl font-bold mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          Sản phẩm nổi bật
        </motion.h2>
        
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
          <motion.div 
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-10 flex justify-between pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button 
              onClick={(e) => {
                e.preventDefault();
                prevSlide();
              }}
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 pointer-events-auto transition-transform duration-300 hover:scale-110"
              aria-label="Previous slide"
              type="button"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </motion.button>
            
            <motion.button 
              onClick={(e) => {
                e.preventDefault();
                nextSlide();
              }}
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 pointer-events-auto transition-transform duration-300 hover:scale-110"
              aria-label="Next slide"
              type="button"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </motion.button>
          </motion.div>
          
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
                  <motion.div 
                    key={i} 
                    className="animate-pulse"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="aspect-square w-full rounded-lg bg-gray-200 skeleton-shimmer" />
                    <div className="mt-2 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200 skeleton-shimmer" />
                      <div className="h-4 w-1/2 rounded bg-gray-200 skeleton-shimmer" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : products.length > 0 ? (
              slides.map((slide, slideIdx) => (
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
                  {/* Only preload current and next slide to save resources */}
                  {slidesToPreload.includes(slideIdx) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {slide.products.map((product, idx) => (
                        <ProductCard 
                          key={product.id} 
                          product={product} 
                          index={idx}
                          // Only prioritize first slide, first two products
                          priority={slideIdx === 0 && idx < 2}
                          brands={brands}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))
            ) : (
              <div className="p-8 bg-white rounded shadow text-center">
                <p className="text-gray-600">Không có sản phẩm nổi bật.</p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </motion.section>
  );
} 