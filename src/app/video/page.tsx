'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';

export default function VideoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [debug, setDebug] = useState<string>('');
  
  const videoRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        // Use all products, no filtering
        const allProducts = data.products || [];
        
        console.log(`Found ${allProducts.length} products total`);
        
        if (allProducts.length === 0) {
          throw new Error('Không tìm thấy sản phẩm nào');
        }
        
        setProducts(allProducts);
        setDebug(`Found ${allProducts.length} products total`);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
        setDebug(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper function to extract YouTube video ID from URL or use default
  const getYouTubeId = (url: string) => {
    if (!url) return 'dQw4w9WgXcQ'; // Default video ID if none exists
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : 'dQw4w9WgXcQ';
  };
  
  // Handle swipe gesture
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      
      // Swipe up (next video)
      if (diff > 50 && currentIndex < products.length - 1 && !isTransitioning) {
        navigateToNextVideo();
      }
      
      // Swipe down (previous video)
      if (diff < -50 && currentIndex > 0 && !isTransitioning) {
        navigateToPreviousVideo();
      }
      
      touchStartY.current = null;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [currentIndex, products.length, isTransitioning]);
  
  // Navigate to next video with transition effect
  const navigateToNextVideo = () => {
    if (currentIndex < products.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };
  
  // Navigate to previous video with transition effect
  const navigateToPreviousVideo = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  // Update debug info when current product changes
  useEffect(() => {
    if (products.length > 0) {
      setDebug(`Item ${currentIndex + 1}/${products.length}: ${products[currentIndex]?.name || 'Unknown'}`);
    }
  }, [currentIndex, products]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-4 text-xl font-bold">Không thể tải sản phẩm</h2>
        <p className="mb-6 text-gray-600">{error || 'Không tìm thấy sản phẩm nào'}</p>
        <button 
          onClick={() => router.push('/')}
          className="rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  const currentProduct = products[currentIndex];
  const videoId = getYouTubeId(currentProduct.video_url || '');
  
  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Video player */}
      <div className={`h-full w-full relative transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        {videoId && (
          <>
            <iframe
              ref={(el) => { videoRefs.current[currentIndex] = el; }}
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&modestbranding=1&rel=0&enablejsapi=1&playsinline=1&playlist=${videoId}&showinfo=0&iv_load_policy=3&fs=0`}
              title=""
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            {/* Transparent overlay to prevent pause on click */}
            <div 
              className="absolute top-0 left-0 w-full h-full z-10" 
              onClick={(e) => e.preventDefault()}
            />
          </>
        )}
      </div>
      
      {/* Video progress indicators */}
      <div className="absolute top-4 left-0 right-0 flex justify-center space-x-1 px-4">
        {products.map((_, index) => (
          <div 
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white' : index < currentIndex ? 'bg-white/60' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
      
      {/* Debug information */}
      <div className="absolute top-8 left-0 right-0 text-center text-white bg-black/50 py-1 px-4">
        {debug}
        <div>
          {currentIndex + 1}/{products.length} (Vuốt lên/xuống để chuyển video)
        </div>
      </div>
    </div>
  );
}
