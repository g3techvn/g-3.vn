'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Product, Brand } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';

// Create a separate component that uses useSearchParams to wrap in Suspense
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
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if user explicitly navigated to this page
  useEffect(() => {
    const fromNavigation = searchParams.get('fromNav') === 'true';
    
    // Only unmute if user explicitly navigated from bottom nav
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
      
      // Use all products, no filtering
      const fetchedProducts = data.products || [];
      
      console.log(`Found ${fetchedProducts.length} products for page ${pageNumber}`);
      
      if (pageNumber === 1) {
        setProducts(fetchedProducts);
      } else {
        setProducts(prev => [...prev, ...fetchedProducts]);
      }
      
      // Check if there are more products to load
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

  // Helper function to extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    if (!url) return 'dQw4w9WgXcQ'; // Default video ID if none exists
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : 'dQw4w9WgXcQ';
  };

  // Setup intersection observer for videos
  useEffect(() => {
    // Cleanup previous observer
    if (videoObserver.current) {
      videoObserver.current.disconnect();
    }

    // Create a new observer
    videoObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const videoIndex = parseInt(entry.target.getAttribute('data-index') || '0', 10);
          
          if (entry.isIntersecting) {
            setActiveVideoIndex(videoIndex);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.7 // At least 70% of the video must be visible
      }
    );

    // Observe all video containers
    videoRefs.current.forEach(ref => {
      if (ref) {
        videoObserver.current?.observe(ref);
      }
    });

    // Cleanup on unmount
    return () => {
      if (videoObserver.current) {
        videoObserver.current.disconnect();
      }
    };
  }, [products]);

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

  // Format the date to display time ago
  const getTimeAgo = (dateString: string) => {
    if (!dateString) return 'Gần đây';
    
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
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
  
  return (
    <div className="container mx-auto h-screen overflow-hidden">
      <div className="h-full overflow-y-auto snap-y snap-mandatory">
        {products.map((product, index) => (
          <div 
            key={index}
            ref={el => { videoRefs.current[index] = el }}
            data-index={index}
            className="relative w-full h-screen snap-start bg-black flex items-center justify-center overflow-hidden max-w-lg mx-auto"
          >
            {/* Video Section */}
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${getYouTubeId(product.video_url || '')}?autoplay=${activeVideoIndex === index ? '1' : '0'}&mute=${isMuted ? '1' : '0'}&playsinline=1&loop=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              title={product.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full object-cover"
            ></iframe>

            {/* Info bottom left */}
            <div className="absolute bottom-20 left-3 z-20 w-3/4">
              <div className="flex items-center mb-2">
                {/* Avatar nếu có */}
                {/* <Image src={product.avatar_url} ... /> */}
                <span
                  className="flex items-center text-white font-bold bg-black/50 px-0 py-1 text-xs mr-2 cursor-pointer"
                  onClick={() => openDrawer(product)}
                >
                  <span className="bg-red-600 rounded-md p-1 mr-2 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                  {product.name}
                </span>
              </div>
              {getBrandName(product) && (
                <div className="text-white font-semibold text-xs mb-1">Thương hiệu {getBrandName(product)}</div>
              )}
              {product.description && (
                <div className="text-white text-sm mb-1 line-clamp-2">{product.description}</div>
              )}
            </div>

            {/* Action buttons right */}
            <div className="absolute bottom-28 right-3 flex flex-col items-center space-y-4 z-20">
              <button className="flex flex-col items-center">
                <div className="bg-white/20 rounded-full p-3 mb-1">
                  {/* Like icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
                <span className="text-white text-xs">1.2k</span>
              </button>
              <button className="flex flex-col items-center">
                <div className="bg-white/20 rounded-full p-3 mb-1">
                  {/* Comment icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <span className="text-white text-xs">60</span>
              </button>
              <button className="flex flex-col items-center">
                <div className="bg-white/20 rounded-full p-3 mb-1">
                  {/* Share icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"></path></svg>
                </div>
                <span className="text-white text-xs">145</span>
              </button>
            </div>

            {/* Mute/Unmute button - only show for active video */}
            {activeVideoIndex === index && (
              <button
                onClick={toggleMute}
                className="absolute top-4 right-4 z-30 rounded-full bg-black/50 p-3"
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5L6 9H2v6h4l5 4zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}
        
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="py-4 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
          </div>
        )}
      </div>

      {/* Drawer sản phẩm */}
      {drawerOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-2xl shadow-lg animate-slide-up relative h-[75vh] flex flex-col justify-between">
            <button
              className="absolute top-2 right-4 text-gray-500 text-2xl"
              onClick={closeDrawer}
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              {selectedProduct.image_url && (
                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-40 h-40 object-cover rounded-lg mb-2" />
              )}
              <div className="text-lg font-bold mb-1">{selectedProduct.name}</div>
              {getBrandName(selectedProduct) && (
                <div className="text-xs text-gray-500 mb-1">Thương hiệu {getBrandName(selectedProduct)}</div>
              )}
              <div className="text-pink-600 font-bold text-xl mb-2">
                {selectedProduct.price && typeof selectedProduct.price === 'number'
                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)
                  : selectedProduct.price}
              </div>
              <div className="text-sm text-gray-700 mb-2">{selectedProduct.description}</div>
              <div className="flex w-full gap-2 mt-4">
                <button className="flex-1 py-2 rounded bg-gray-100 text-gray-900 font-semibold">Thêm vào giỏ hàng</button>
                <button className="flex-1 py-2 rounded bg-pink-600 text-white font-semibold">Mua ngay</button>
              </div>
            </div>
          </div>
        </div>
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
