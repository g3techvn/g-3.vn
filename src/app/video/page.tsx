'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Product, Brand } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { VideoPlayer } from '@/components/mobile/video/VideoPlayer';
import { VideoActions } from '@/components/mobile/video/VideoActions';
import { VideoInfo } from '@/components/mobile/video/VideoInfo';
import { VideoDrawer } from '@/components/mobile/video/VideoDrawer';

function VideoContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoObserver = useRef<IntersectionObserver | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if user explicitly navigated to this page
  useEffect(() => {
    const fromNavigation = searchParams.get('fromNav') === 'true';
    if (fromNavigation) {
      setIsMuted(false);
    }
  }, [searchParams]);
  
  // Fetch products with pagination
  const fetchProducts = useCallback(async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await fetch(`/api/products?page=${pageNumber}&limit=10`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      const fetchedProducts = (data.products || []).filter((product: Product) => 
        product.video_url && 
        product.video_url.trim() !== '' && 
        product.video_url !== null
      );
      
      console.log('Video page - Products with videos:', fetchedProducts.length);
      console.log('Video page - Sample video URLs:', fetchedProducts.slice(0, 3).map((p: Product) => p.video_url));
      
      if (pageNumber === 1) {
        setProducts(fetchedProducts);
      } else {
        setProducts(prev => [...prev, ...fetchedProducts]);
      }
      
      setHasMore(fetchedProducts.length === 10);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
    } finally {
      if (pageNumber === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        if (!response.ok) throw new Error('Lỗi khi tải thương hiệu');
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (err) {
        console.error('Error fetching brands:', err);
      }
    };
    fetchBrands();
  }, []);

  // Initial data load
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Setup intersection observer for videos
  useEffect(() => {
    if (videoObserver.current) {
      videoObserver.current.disconnect();
    }

    videoObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const videoIndex = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          
          if (entry.isIntersecting) {
            setActiveVideoIndex(videoIndex);
          } else if (activeVideoIndex === videoIndex) {
            setActiveVideoIndex(null);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      }
    );

    videoRefs.current.forEach(ref => {
      if (ref) {
        videoObserver.current?.observe(ref);
      }
    });

    return () => {
      if (videoObserver.current) {
        videoObserver.current.disconnect();
      }
    };
  }, [products, activeVideoIndex]);

  // Implement infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        !loadingMore && 
        hasMore && 
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 500
      ) {
        setPage(prevPage => prevPage + 1);
        fetchProducts(page + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchProducts, hasMore, loadingMore, page]);

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Helper để lấy tên brand từ brand_id
  const getBrandName = (product: Product) => {
    if (product.brand) return product.brand;
    if (product.brand_id && brands.length > 0) {
      const found = brands.find(b => String(b.id) === String(product.brand_id));
      return found ? found.title : '';
    }
    return '';
  };

  const openDrawer = (product: Product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-4 text-xl font-bold">Không thể tải video</h2>
        <p className="mb-6 text-gray-600">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          Quay lại Trang chủ
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-4 text-xl font-bold">Chưa có video sản phẩm</h2>
        <p className="mb-6 text-gray-600">
          Chúng tôi đang cập nhật video cho các sản phẩm. 
          <br />Vui lòng quay lại sau.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Xem Sản phẩm
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto h-screen overflow-hidden">
      <div className="h-full overflow-y-auto snap-y snap-mandatory pb-24">
        {products.map((product, index) => (
          <div 
            key={index}
            ref={el => { videoRefs.current[index] = el }}
            data-index={index}
            className="relative w-full h-screen snap-start bg-black flex items-center justify-center overflow-hidden max-w-lg mx-auto"
          >
            <VideoPlayer
              videoUrl={product.video_url || ''}
              isActive={activeVideoIndex === index}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />

            <VideoInfo
              product={product}
              brandName={getBrandName(product)}
              onOpenDrawer={() => openDrawer(product)}
            />

            <VideoActions onOpenDrawer={() => openDrawer(product)} />
          </div>
        ))}
        
        {loadingMore && (
          <div className="py-4 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <VideoDrawer
          isOpen={drawerOpen}
          onClose={closeDrawer}
          product={selectedProduct}
          brandName={getBrandName(selectedProduct)}
        />
      )}
    </div>
  );
}

export default function VideoPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
      </div>
    }>
      <VideoContent />
    </Suspense>
  );
}
