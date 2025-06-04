'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Breadcrumb } from '@/components/pc/common/Breadcrumb';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import BrandShopeeHeader from '@/components/mobile/BrandShopeeHeader';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import { useParams } from 'next/navigation';
import { ProductCard } from '@/components/pc/product/ProductCard';

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

export default function BrandProductsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>('');
  const [brandImageUrl, setBrandImageUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Sản phẩm');
  const [openVideo, setOpenVideo] = useState<null | { videoUrl: string; name: string; isPortrait?: boolean }>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        // Fetch brand and products data
        const response = await fetch(`/api/brands/${slug}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.brand) {
          setBrandName(data.brand.title || '');
          setBrandImageUrl(data.brand.image_square_url || data.brand.image_url || '');
        }
        
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching brand data:', error);
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
          avatarUrl={brandImageUrl}
          products={products}
          activeTab={activeTab}
          onTabChange={setActiveTab}
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
          {activeTab === 'Sản phẩm' && (
            <>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-4 px-2 sm:px-4 md:px-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                  <p className="text-lg text-gray-600">Không tìm thấy sản phẩm nào.</p>
                </div>
              )}
            </>
          )}
          {activeTab === 'Danh mục' && (
            <div className="p-4 bg-white">
              <ul className="divide-y divide-gray-200">
                {[
                  { name: 'GHẾ CÔNG THÁI HỌC', href: '#', imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=40&h=40&fit=crop&q=80' },
                  { name: 'BÀN NÂNG HẠ', href: '#', imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=40&h=40&fit=crop&q=80' },
                  { name: 'BÀN GHẾ TRẺ EM', href: '#', imageUrl: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=40&h=40&fit=crop&q=80' },
                  { name: 'PHỤ KIỆN', href: '#', imageUrl: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=40&h=40&fit=crop&q=80' },
                ].map((category) => (
                  <li key={category.name}>
                    <Link 
                      href={category.href} 
                      className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-600 transition-colors duration-150 space-x-3"
                    >
                      <Image 
                        src={category.imageUrl} 
                        alt={category.name} 
                        width={40} 
                        height={40} 
                        className="rounded-full object-cover"
                      />
                      <span>{category.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'Video' && (
            <div>
              {(() => {
                const videos = products.filter(p => p.video_url);
                if (videos.length === 0) {
                  return <p className="text-center text-gray-600">Không có video nào cho thương hiệu này.</p>;
                }
                // Hàm chuyển link YouTube thường sang embed
                const getEmbedUrl = (url: string) => {
                  if (!url) return '';
                  // YouTube dạng watch?v=...
                  const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/);
                  if (ytMatch) {
                    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
                  }
                  // YouTube dạng youtu.be/...
                  const ytShort = url.match(/(?:https?:\/\/)?youtu\.be\/([\w-]+)/);
                  if (ytShort) {
                    return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1`;
                  }
                  // Nếu đã là embed hoặc link khác thì trả về nguyên bản
                  // For non-YouTube URLs, autoplay might work if the URL itself supports it or if the provider has other means
                  // We could also try to append ?autoplay=1 generically, but it might break some URLs.
                  // For now, only adding it to known YouTube patterns.
                  if (url.includes('youtube.com/embed/')) {
                    return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
                  }
                  return url;
                };
                return (
                  <>
                    <div className="grid grid-cols-3">
                      {videos.map((product, idx) => {
                        const isLastRow = Math.floor(idx / 3) === Math.floor((videos.length - 1) / 3);
                        const isLastCol = (idx + 1) % 3 === 0;
                        return (
                          <button
                            key={product.id}
                            className={
                              "aspect-w-1 aspect-h-1 overflow-hidden focus:outline-none " +
                              (isLastRow ? "" : "border-b border-gray-300 ") +
                              (isLastCol ? "" : "border-r border-gray-300 ")
                            }
                            onClick={() => setOpenVideo({ videoUrl: getEmbedUrl(product.video_url!), name: product.name })}
                            title={product.name}
                          >
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={300}
                              height={300}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                    {/* Modal popup video */}
                    {openVideo && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md" onClick={() => setOpenVideo(null)}>
                        {/* Fullscreen Video Area (relative container for header and iframe) */}
                        <div className="relative w-screen h-screen" onClick={e => e.stopPropagation()}>
                          {/* New Header with white background */}
                          <div className="absolute top-0 left-0 right-0 h-14 bg-white flex items-center px-4 z-10 shadow-md">
                            <button 
                              className="text-gray-700 hover:text-gray-900 flex items-center p-2 rounded hover:bg-gray-100 transition-colors duration-150"
                              onClick={(e) => { e.stopPropagation(); setOpenVideo(null); }}
                              aria-label="Go back"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                              Back
                            </button>
                            {/* Spacer to push a new button to the right if needed, or for title */}
                            <div className="flex-grow"></div> 
                            {/* Three dots button for context menu */}
                            <div className="relative">
                              <button
                                className="text-gray-700 hover:text-gray-900 p-2 rounded-full hover:bg-gray-200 transition-colors duration-150"
                                onClick={(e) => { e.stopPropagation(); setIsContextMenuOpen(!isContextMenuOpen); }}
                                aria-label="More options"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                </svg>
                              </button>
                              {/* Context Menu Panel */}
                              {isContextMenuOpen && (
                                <div 
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5 focus:outline-none"
                                  role="menu" 
                                  aria-orientation="vertical" 
                                  aria-labelledby="options-menu"
                                >
                                  <button
                                    onClick={() => { 
                                      console.log('Share action triggered for:', openVideo?.videoUrl);
                                      // Implement Web Share API or other sharing logic here
                                      setIsContextMenuOpen(false); 
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    role="menuitem"
                                  >
                                    Share
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (openVideo?.videoUrl) {
                                        navigator.clipboard.writeText(openVideo.videoUrl)
                                          .then(() => console.log('Link copied:', openVideo.videoUrl))
                                          .catch(err => console.error('Failed to copy link:', err));
                                      }
                                      setIsContextMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    role="menuitem"
                                  >
                                    Copy link
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Iframe container (takes full space of its parent) */}
                          <div className="w-full h-full">
                            <iframe
                              src={openVideo.videoUrl}
                              title={openVideo.name}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            ></iframe>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 