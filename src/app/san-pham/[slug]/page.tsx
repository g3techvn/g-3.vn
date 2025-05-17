'use client';

import React, { use, useCallback } from 'react';
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import Image from 'next/image';
import { MobileShopeeProductDetail } from '@/components/mobile/detail-product/MobileShopeeProductDetail';
import { ArrowPathIcon, ShieldCheckIcon, TruckIcon, WrenchScrewdriverIcon, ShoppingCartIcon, CheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Card, CardBadge, CardContent, CardHeader } from '@/components/ui/Card';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Rating } from '@/components/ui/Rating';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ImageItem } from '@/types/supabase';

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

// Define Comment interface at the top
interface Comment {
  id: string;
  user: {
    name: string;
  };
  rating: number;
  content: string;
  date: string;
  likes: number;
  publisherReply?: {
    name: string;
    date: string;
    content: string;
  };
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0); // 0: video, 1: main image
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const videoRef = React.useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<YTPlayer | null>(null);
  const router = useRouter();
  
  // Add new state for gallery images from Supabase
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Add product comments data
  const [comments] = useState<Comment[]>([
    {
      id: '1',
      user: { name: 'Tám Phạm' },
      rating: 5,
      content: 'Ghế công thái học này thực sự rất thoải mái, ngồi làm việc lâu không bị đau lưng. Chất liệu tốt, lắp ráp dễ dàng. Rất đáng tiền!',
      date: '26/4/2025',
      likes: 156,
      publisherReply: {
        name: 'G3-TECH',
        date: '26/4/2025',
        content: 'Cảm ơn bạn đã tin tưởng và lựa chọn ghế công thái học của G3-TECH. Chúng tôi rất vui khi sản phẩm giúp bạn làm việc thoải mái hơn. Nếu cần hỗ trợ thêm, bạn cứ liên hệ với chúng tôi nhé!'
      }
    },
    {
      id: '2',
      user: { name: 'Anh Trương' },
      rating: 4,
      content: 'Ghế ngồi êm, tựa lưng tốt nhưng phần kê tay hơi thấp so với mình. Mong shop có thêm phụ kiện nâng kê tay.',
      date: '11/5/2025',
      likes: 23
    },
    {
      id: '3',
      user: { name: 'Minh Hằng' },
      rating: 5,
      content: 'Mình rất thích thiết kế của ghế, hiện đại và chắc chắn. Giao hàng nhanh, đóng gói cẩn thận. Sẽ giới thiệu cho bạn bè!',
      date: '2/6/2025',
      likes: 41
    }
  ]);
  
  // Add rating summary data
  const [ratingSummary] = useState({
    average: 4.1,
    total: 394168,
    stars: [
      { star: 5, count: 300000 },
      { star: 4, count: 60000 },
      { star: 3, count: 20000 },
      { star: 2, count: 8000 },
      { star: 1, count: 6200 },
    ]
  });

  // Helper function to get random color from name for avatar
  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Video info
  const getVideoInfo = () => {
    if (product?.video_url) {
      // Extract YouTube video ID from URL
      const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };

      const videoId = getYouTubeId(product.video_url);
      
      if (videoId) {
        return {
          type: 'video' as const,
          videoUrl: `https://www.youtube.com/embed/${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    }
    
    // Fallback to default video if no valid video_url
    return {
      type: 'video' as const,
      videoUrl: 'https://www.youtube.com/embed/c2F2An3YU04',
      thumbnail: 'https://img.youtube.com/vi/c2F2An3YU04/hqdefault.jpg',
    };
  };
  
  const video = getVideoInfo();

  // Create galleryItems based on product and fetched gallery images
  const galleryItems = [
    ...(product?.image_url ? [{ type: 'image' as const, url: product.image_url }] : []),
    video,
    ...galleryImages
      .filter(url => url !== product?.image_url)
      .map(url => ({ type: 'image' as const, url }))
  ];

  // Sửa fetch liên tục: fetchSimilarProducts chỉ nhận productId, không phụ thuộc product object
  const fetchSimilarProducts = async (productId: string) => {
    try {
      setLoadingSimilar(true);
      const response = await fetch(`/api/products?limit=12`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const allProducts = data.products || [];
      const randomProducts = allProducts
        .filter((p: Product) => p.id !== productId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      setSimilarProducts(randomProducts);
    } catch (error) {
      console.error('Error fetching similar products:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${slug}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProduct(data.product);
        // Gọi fetchSimilarProducts sau khi đã có product id
        if (data.product && data.product.id) {
          fetchSimilarProducts(data.product.id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // Add useEffect to fetch gallery images from Supabase
  useEffect(() => {
    const fetchGalleryImages = async () => {
      if (!product?.gallery_url) {
        setGalleryImages([]);
        return;
      }

      try {
        setIsLoadingGallery(true);
        const response = await fetch(`/api/images?folder=${encodeURIComponent(product.gallery_url)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          const imageUrls = data.images.map((img: ImageItem) => img.url);
          setGalleryImages(imageUrls);
        } else {
          setGalleryImages([]);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        setGalleryImages([]);
      } finally {
        setIsLoadingGallery(false);
      }
    };

    if (product) {
      fetchGalleryImages();
    }
  }, [product]);

  React.useEffect(() => {
    if (selectedIndex !== 0) return;
    // Lắng nghe sự kiện ended của YouTube Player API
    let currentPlayer: YTPlayer | null = null;
    function onPlayerReady(event: YTPlayerEvent) {
      event.target.mute();
      event.target.playVideo();
    }
    function onPlayerStateChange(event: YTOnStateChangeEvent) {
      // 0 = ended
      if (event.data === 0) {
        setSelectedIndex(1);
      }
    }
    // Chỉ gắn khi là video
    if (window.YT && videoRef.current) {
      currentPlayer = new window.YT.Player(videoRef.current, {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      setPlayer(currentPlayer);
    } else {
      // Nếu chưa có YT, load script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => {
        if (videoRef.current) {
          currentPlayer = new window.YT.Player(videoRef.current, {
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
          setPlayer(currentPlayer);
        }
      };
    }
    return () => {
      if (currentPlayer && currentPlayer.destroy) currentPlayer.destroy();
    };
  }, [selectedIndex]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 w-1/4 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-lg text-gray-600">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <MobileShopeeProductDetail 
        product={product} 
        galleryImages={galleryImages}
        videoInfo={{
          videoUrl: video.videoUrl,
          thumbnail: video.thumbnail
        }}
        comments={comments}
        ratingSummary={ratingSummary}
      />

      {/* Desktop View */}
      <div className="hidden md:block container mx-auto py-8">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Sản phẩm', href: '/san-pham' },
            { label: product.name }
          ]}
        />

        <div className="mt-8">
          {/* Product Content */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative overflow-visible">
            {/* Product Image */}
            <div className="md:col-span-3">
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                {/* Nút mũi tên trái */}
                {selectedIndex > 0 && (
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                    onClick={() => setSelectedIndex(selectedIndex - 1)}
                    aria-label="Ảnh trước"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                {/* Hiển thị loading state hoặc video/image */}
                {isLoadingGallery ? (
                  // Loading state for main gallery image
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-3 border-t-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="mt-4 text-sm text-gray-600">Đang tải ảnh sản phẩm...</span>
                  </div>
                ) : galleryItems.length > 0 && selectedIndex >= 0 && selectedIndex < galleryItems.length ? (
                  galleryItems[selectedIndex].type === 'video'
                    ? (
                      <iframe
                        ref={videoRef}
                        id="product-video-yt"
                        width="100%"
                        height="100%"
                        src={(galleryItems[selectedIndex] as typeof video).videoUrl + '?enablejsapi=1&autoplay=1&mute=1'}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full rounded-lg"
                      />
                    )
                    : (
                      <Image
                        src={(galleryItems[selectedIndex] as {type: 'image', url: string}).url}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 60vw"
                        priority
                      />
                    )
                ) : (
                  <div className="text-red-500">Không có dữ liệu gallery hoặc index không hợp lệ</div>
                )}
                {/* Nút mũi tên phải */}
                {selectedIndex < galleryItems.length - 1 && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                    onClick={() => setSelectedIndex(selectedIndex + 1)}
                    aria-label="Ảnh sau"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </div>
              
              {/* Gallery */}
              <div className="mt-4 flex overflow-x-auto gap-2 pb-2">
                {isLoadingGallery ? (
                  // Loading indicator for gallery thumbnails
                  <div className="flex items-center justify-center w-full py-4">
                    <div className="w-5 h-5 border-2 border-t-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-sm text-gray-600">Đang tải ảnh...</span>
                  </div>
                ) : (
                  // Render gallery thumbnails
                  galleryItems.map((item, index) => {
                    if (item.type === 'video') {
                      return (
                        <div
                          key={`video-${index}`}
                          className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer flex items-center justify-center ${selectedIndex === index ? 'border-red-500' : 'border-gray-200'}`}
                          onClick={() => setSelectedIndex(index)}
                        >
                          <Image
                            src={(item as typeof video).thumbnail}
                            alt="Video thumbnail"
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="20" cy="20" r="20" fill="rgba(0,0,0,0.5)" />
                              <polygon points="16,12 30,20 16,28" fill="white" />
                            </svg>
                          </span>
                        </div>
                      );
                    } else if (item.type === 'image') {
                      return (
                        <div
                          key={`image-${index}-${(item as {type: 'image', url: string}).url}`}
                          className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${selectedIndex === index ? 'border-red-500' : 'border-gray-200'}`}
                          onClick={() => setSelectedIndex(index)}
                        >
                          <Image
                            src={(item as {type: 'image', url: string}).url}
                            alt={`${product.name} - ${index}`}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      );
                    }
                    return null;
                  })
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:col-span-2 space-y-6 sticky top-20 self-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {product.brand && (
                  <p className="text-lg text-gray-600 mt-2">Thương hiệu: {product.brand}</p>
                )}
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.price)}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.original_price)}
                  </span>
                )}
                {product.discount_percentage && (
                  <span className="text-sm font-medium text-red-600">
                    -{product.discount_percentage}%
                  </span>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    // TODO: Implement buy now functionality
                  }}
                >
                  <CheckIcon className="h-5 w-5" />
                  Mua ngay
                </button>
                <button
                  className="flex-1 bg-red-100 text-red-800 px-6 py-3 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                    if (product && !isAddingToCart) {
                      setIsAddingToCart(true);
                      addToCart(product);
                      // Reset state after animation
                      setTimeout(() => {
                        setIsAddingToCart(false);
                      }, 1000);
                    }
                  }}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <ShoppingCartIcon className="h-5 w-5" />
                  )}
                  Thêm vào giỏ hàng
                </button>
              </div>

              {/* Policy Section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-red-700">Chính sách mua hàng tại G3-TECH</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ArrowPathIcon className="w-6 h-6 text-red-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-800">1 đổi 1 chi tiết lỗi trong 15 ngày</span>
                      <div className="text-xs text-gray-500">nếu lỗi do nhà sản xuất</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="w-6 h-6 text-red-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-800">Bảo hành phần cơ khí 12 tháng, lưới 6 tháng</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TruckIcon className="w-6 h-6 text-red-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-800">Vận chuyển toàn quốc, nhận hàng kiểm tra trước khi thanh toán</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <WrenchScrewdriverIcon className="w-6 h-6 text-red-600 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-800">Miễn phí lắp đặt tại Hà Nội và TP. Hồ Chí Minh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description Section */}
          <div className="mt-8 grid grid-cols-5 gap-8">
            {/* Main Content - 3 columns */}
            <div className="col-span-3 prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tổng quan</h3>
                  <p className="text-gray-600">
                    Ghế công thái học cao cấp G3-TECH là sự kết hợp hoàn hảo giữa thiết kế hiện đại và công nghệ tiên tiến, mang lại trải nghiệm ngồi vượt trội cho người dùng. Sản phẩm được nghiên cứu kỹ lưỡng nhằm hỗ trợ tối đa cho cột sống, giảm thiểu các vấn đề về sức khỏe thường gặp ở dân văn phòng như đau lưng, mỏi cổ, và căng thẳng cơ bắp.
                  </p>
                  <p className="text-gray-600">
                    Với khung ghế chắc chắn, lưới thoáng khí đạt chuẩn quốc tế và các bộ phận điều chỉnh linh hoạt, ghế phù hợp cho nhiều đối tượng sử dụng, từ nhân viên văn phòng, game thủ đến học sinh, sinh viên. Thiết kế tối ưu giúp người dùng duy trì tư thế ngồi đúng, tăng hiệu quả làm việc và học tập trong thời gian dài.
                  </p>
                  <p className="text-gray-600">
                    Ngoài ra, sản phẩm còn được trang bị các tính năng thông minh như tựa đầu 8D, kê tay xoay 360 độ, trượt mâm linh hoạt và cơ chế ngả đa cấp, đáp ứng mọi nhu cầu cá nhân hóa trải nghiệm ngồi.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tính năng nổi bật</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Hệ thống điều chỉnh độ cao thông minh, phù hợp với nhiều chiều cao bàn làm việc.</li>
                    <li>Đệm lưng và tựa đầu có thể điều chỉnh linh hoạt, hỗ trợ tối đa cho cột sống cổ và lưng.</li>
                    <li>Chất liệu lưới Solidmesh USA đạt chứng chỉ OEKO-TEX® STANDARD 100, đảm bảo an toàn và thoáng khí.</li>
                    <li>Khung chân hợp kim nhôm bền bỉ, chống rỉ sét, chịu tải trọng lớn.</li>
                    <li>Trượt mâm biên độ 5cm, dễ dàng điều chỉnh vị trí ngồi phù hợp với chiều dài chân.</li>
                    <li>Kê tay xoay 360 độ, hỗ trợ tối ưu cho khủy tay khi làm việc, học tập hoặc giải trí.</li>
                    <li>Cơ chế ngả lưng đa cấp, giữ khóa an toàn ở từng vị trí, giúp thư giãn hiệu quả.</li>
                    <li>Thiết kế hiện đại, màu sắc sang trọng, phù hợp với nhiều không gian nội thất.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Lợi ích sử dụng</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Giảm đau lưng, đau vai gáy và các vấn đề về cột sống do ngồi lâu.</li>
                    <li>Tăng cường sự tập trung và hiệu suất làm việc nhờ tư thế ngồi chuẩn.</li>
                    <li>Giúp không gian làm việc trở nên chuyên nghiệp, hiện đại hơn.</li>
                    <li>Dễ dàng vệ sinh, bảo trì và sử dụng lâu dài với độ bền cao.</li>
                    <li>Phù hợp cho nhiều đối tượng: nhân viên văn phòng, học sinh, sinh viên, game thủ...</li>
                    <li>Chính sách bảo hành và hậu mãi uy tín từ G3-TECH.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Hướng dẫn sử dụng & bảo quản</h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Điều chỉnh chiều cao ghế và tựa đầu phù hợp với vóc dáng trước khi sử dụng.</li>
                    <li>Vệ sinh bề mặt lưới và khung ghế định kỳ bằng khăn mềm, tránh hóa chất tẩy rửa mạnh.</li>
                    <li>Kiểm tra các khớp xoay, ốc vít định kỳ để đảm bảo an toàn khi sử dụng lâu dài.</li>
                    <li>Không để ghế tiếp xúc trực tiếp với ánh nắng mặt trời hoặc môi trường ẩm ướt kéo dài.</li>
                  </ol>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Câu hỏi thường gặp</h2>
                <div className="space-y-2">
                  {[
                    {
                      question: "Ghế công thái học phù hợp cho đối tượng nào?",
                      answer: "Ghế phù hợp cho nhân viên văn phòng, học sinh, sinh viên, game thủ và bất kỳ ai cần ngồi lâu."
                    },
                    {
                      question: "Bảo hành sản phẩm trong bao lâu?",
                      answer: "Sản phẩm được bảo hành 12 tháng cho phần cơ khí và 6 tháng cho lưới."
                    },
                    {
                      question: "Có hỗ trợ lắp đặt tại nhà không?",
                      answer: "G3-TECH hỗ trợ lắp đặt miễn phí tại Hà Nội và TP. Hồ Chí Minh."
                    }
                  ].map((item, idx) => (
                    <details key={idx} className="bg-gray-50 rounded p-4">
                      <summary className="font-semibold cursor-pointer">{item.question}</summary>
                      <div className="mt-2 text-gray-700">{item.answer}</div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Đánh giá & Nhận xét</h2>
                {/* Tổng quan điểm đánh giá */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex flex-col items-center min-w-[70px]">
                    <span className="text-4xl font-bold text-gray-900 leading-none">{ratingSummary.average.toFixed(1)}</span>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.round(ratingSummary.average) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 "/></svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{ratingSummary.total.toLocaleString()}</span>
                  </div>
                  {/* Biểu đồ sao */}
                  <div className="flex-1 flex flex-col gap-1">
                    {ratingSummary.stars.map((starItem) => {
                      const percent = (starItem.count / ratingSummary.total) * 100;
                      return (
                        <div key={starItem.star} className="flex items-center gap-2">
                          <span className="text-xs w-3 text-gray-700">{starItem.star}</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded">
                            <div className="h-2 rounded bg-blue-500" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Danh sách bình luận */}
                <div className="space-y-8">
                  {comments.map((comment) => (
                    <div key={comment.id}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full ${getRandomColor(comment.user.name)} flex items-center justify-center text-white font-medium text-lg`}>{getInitials(comment.user.name)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{comment.user.name}</span>
                            <span className="text-xs text-gray-500">{comment.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 "/></svg>
                            ))}
                          </div>
                          <p className="text-gray-800 text-sm mt-2">{comment.content}</p>
                          <div className="mt-2 text-xs text-gray-500">{comment.likes} người thấy bài đánh giá này hữu ích</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-700">Bài đánh giá này có hữu ích không?</span>
                            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Có</button>
                            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Không</button>
                          </div>
                          {comment.publisherReply && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-xs text-gray-700">{comment.publisherReply.name}</span>
                                <span className="text-xs text-gray-400">{comment.publisherReply.date}</span>
                              </div>
                              <div className="text-gray-700 text-sm whitespace-pre-line">{comment.publisherReply.content}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical Specifications - 2 columns */}
            <div className="col-span-2">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
                <div className="divide-y divide-gray-200">
                  <div className="flex justify-between py-3">
                    <span className="font-semibold">Bộ điều khiển thông minh</span>
                    <span className="text-right">Multi Button bằng nút</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold">Cơ chế ngả</span>
                    <span className="text-right">Ngả lưng lên tới 4 cấp, giữ khóa ngả ở mỗi cấp</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold">Chất liệu lưới</span>
                    <span className="text-right">Solidmesh USA (chứng chỉ OEKO-TEX® STANDARD 100)</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold">Trượt mâm</span>
                    <span className="text-right">Trượt tiến lùi biên độ 5cm</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold">Chất liệu chân</span>
                    <span className="text-right">Chân hợp kim nhôm bền bỉ chống rỉ</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold">Điều chỉnh kháng lực + Trụ thủy lực</span>
                    <span className="text-right">Cơ chế kháng lực Tension Control linh hoạt + Trụ thủy lực WITHUS Class 4</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold">Tựa đầu</span>
                    <span className="text-right">HeadFlex 8D thông minh</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold">Tựa lưng</span>
                    <span className="text-right">Butterfit 2D cánh bướm + 4 lò xo chỉnh lên xuống nhiều nấc ôm trọn thắt lưng</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="font-semibold">Kê tay</span>
                    <span className="text-right">Xoay360 độ giúp đỡ khuỷ tay tốt nhất</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Products Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm tương tự</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {loadingSimilar ? (
                // Loading skeleton
                [...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square w-full rounded-lg bg-gray-200" />
                    <div className="mt-2 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-4 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                ))
              ) : similarProducts.length > 0 ? (
                similarProducts.map((product) => (
                  <div key={product.id} className="relative">
                    <Link href={`/san-pham/${product.slug || product.id}`}>
                      <Card className="h-full relative">
                        <CardHeader>
                          {product.discount_percentage && product.discount_percentage > 0 && (
                            <CardBadge>-{product.discount_percentage}%</CardBadge>
                          )}
                          <AspectRatio ratio={1 / 1}>
                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  width={300}
                                  height={300}
                                  className="w-full h-auto object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </div>
                          </AspectRatio>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="text-xs text-gray-500 mb-1">{product.brand || 'Không rõ'}</div>
                          
                          <h3 className="text-xs font-medium mb-2 text-gray-800 group-hover:text-red-600 line-clamp-2 h-[2.5rem]">
                            {product.name}
                          </h3>
                          
                          <Rating value={product.rating || 4} className="mb-2" />
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              {product.original_price ? (
                                <>
                                  <span className="text-gray-500 line-through text-xs">
                                    {product.original_price.toLocaleString()}₫
                                  </span>
                                  <span className="text-red-600 font-bold text-sm block">
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
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
                  <p className="text-base text-gray-600">Không tìm thấy sản phẩm tương tự.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 