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

export default function CategoryProductsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categoryImageUrl, setCategoryImageUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Sản phẩm');
  const [openVideo, setOpenVideo] = useState<null | { videoUrl: string; name: string; isPortrait?: boolean }>(null);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/categories/${slug}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        if (data.category) {
          setCategoryName(data.category.name || '');
          setCategoryImageUrl(data.category.image_square_url || data.category.image_url || '');
        }
        
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching category products:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while fetching category products');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
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
          brandName={categoryName || 'Danh mục sản phẩm'}
          avatarUrl={categoryImageUrl || 'https://placehold.co/80x80/e2e8f0/475569?text=Category'}
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
              { label: 'Danh mục', href: '/categories' },
              { label: categoryName || slug }
            ]}
          />
        </div>

        <div>
          {activeTab === 'Sản phẩm' && (
            <>
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
                            className="w-full h-full object-cover"
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
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                  <p className="text-lg text-gray-600">Không tìm thấy sản phẩm nào trong danh mục này.</p>
                </div>
              )}
            </>
          )}
          {activeTab === 'Danh mục' && (
            <div className="p-4 bg-white">
              <ul className="divide-y divide-gray-200">
                {products.reduce((uniqueCategories, product) => {
                  const existingCategory = uniqueCategories.find(p => p.category_id === product.category_id);
                  if (!existingCategory) {
                    uniqueCategories.push(product);
                  }
                  return uniqueCategories;
                }, [] as Product[]).map((product) => (
                  <li key={product.category_id}>
                    <Link 
                      href={`/categories/${product.slug || product.category_id}`}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-red-600 transition-colors duration-150 space-x-3"
                    >
                      <Image 
                        src={product.image_square_url || product.image_url} 
                        alt={product.name} 
                        width={40} 
                        height={40} 
                        className="rounded-full object-cover"
                      />
                      <span>{product.category_name || product.name}</span>
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
                  return <p className="text-center text-gray-600">Không có video nào cho danh mục này.</p>;
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
                        <div className="relative w-screen h-screen" onClick={e => e.stopPropagation()}>
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
                            <div className="flex-grow"></div>
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