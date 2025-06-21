'use client';

import React, { use, useCallback } from 'react';
import { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/types';
import { Breadcrumb } from '@/components/pc/common/Breadcrumb';
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
import { ProductDetailDesktop } from '@/components/pc/product-detail/ProductDetailDesktop';
import { Metadata } from 'next';
import { generateMetadata } from '@/app/metadata';
import { FloatProductAction } from '@/components/pc/product-detail/FloatProductAction';
import { ProductVariants } from '@/components/pc/product-detail/ProductVariants';
import { ProductJsonLd } from '@/components/SEO/ProductJsonLd';
import { BreadcrumbJsonLd, generateBreadcrumbItems } from '@/components/SEO/BreadcrumbJsonLd';
import { FAQJsonLd, generateProductFAQs } from '@/components/SEO/FAQJsonLd';
import { SocialMetaTags } from '@/components/SEO/SocialMetaTags';
import { generateProductMeta } from '@/lib/utils/seo-utils';
import dynamic from 'next/dynamic';

// ✅ Lazy load SEO components for better initial performance
const LazyProductJsonLd = dynamic(() => import('@/components/SEO/ProductJsonLd').then(mod => ({ default: mod.ProductJsonLd })), {
  ssr: false // SEO structured data can load after initial render
});

const LazyBreadcrumbJsonLd = dynamic(() => import('@/components/SEO/BreadcrumbJsonLd').then(mod => ({ default: mod.BreadcrumbJsonLd })), {
  ssr: false
});

const LazyFAQJsonLd = dynamic(() => import('@/components/SEO/FAQJsonLd').then(mod => ({ default: mod.FAQJsonLd })), {
  ssr: false
});

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

// Add interface for technical specifications
interface TechnicalSpec {
  title: string;
  value: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

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

  // Add technical specifications data
  const [technicalSpecs, setTechnicalSpecs] = useState<TechnicalSpec[]>([]);

  // Add product detail sections data
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [overview, setOverview] = useState<string>('');

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
    
    return null;
  };
  
  const video = getVideoInfo();

  // Create galleryItems based on product and fetched gallery images
  const galleryItems = [
    ...(product?.image_url ? [{ type: 'image' as const, url: product.image_url }] : []),
    ...(video ? [video] : []),
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
      
      // Get current product's brand
      const currentProduct = allProducts.find((p: Product) => p.id === productId);
      if (!currentProduct?.brand) {
        setSimilarProducts([]);
        return;
      }

      // Filter products with same brand and exclude current product
      const sameBrandProducts = allProducts
        .filter((p: Product) => 
          p.id !== productId && 
          p.brand && 
          p.brand.toLowerCase() === currentProduct.brand.toLowerCase()
        )
        .slice(0, 6);

      setSimilarProducts(sameBrandProducts);
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
        console.log("Product data:", data.product);
        setProduct(data.product);
        
        // Set default variant if available
        if (data.product?.variants?.length > 0) {
          const defaultVariant = data.product.variants.find((v: ProductVariant) => v.is_default) || data.product.variants[0];
          setSelectedVariant(defaultVariant);
        }
        
        // Set product detail sections data
        if (data.product) {
          try {
            // Set key features from tinh_nang field
            setKeyFeatures(data.product.tinh_nang ? 
              (Array.isArray(data.product.tinh_nang) ? data.product.tinh_nang : [data.product.tinh_nang]) : 
              []);
            
            // Set benefits from loi_ich field
            setBenefits(data.product.loi_ich ? 
              (Array.isArray(data.product.loi_ich) ? data.product.loi_ich : [data.product.loi_ich]) : 
              []);
            
            // Set instructions from huong_dan field
            setInstructions(data.product.huong_dan ? 
              (Array.isArray(data.product.huong_dan) ? data.product.huong_dan : [data.product.huong_dan]) : 
              []);
            
            // Set overview from description field
            setOverview(data.product.description || '');
            
            // Process technical specifications
            if (data.product.thong_so_ky_thuat) {
              // Handle different formats the API might return
              if (Array.isArray(data.product.thong_so_ky_thuat)) {
                            // If already in the correct format, use it directly
            if (data.product.thong_so_ky_thuat.length > 0 && 
                typeof data.product.thong_so_ky_thuat[0] === 'object' &&
                ('title' in data.product.thong_so_ky_thuat[0] || 'name' in data.product.thong_so_ky_thuat[0]) && 
                'value' in data.product.thong_so_ky_thuat[0]) {
              // Map to ensure title property exists
              setTechnicalSpecs(
                data.product.thong_so_ky_thuat.map((spec: { title?: string; name?: string; value: any }) => ({
                  title: spec.title || spec.name || '',
                  value: typeof spec.value === 'string' ? spec.value : String(spec.value)
                }))
              );
            } else {
              // Convert array of strings to title/value pairs
              setTechnicalSpecs(
                data.product.thong_so_ky_thuat.map((spec: string, index: number) => ({
                  title: `Thông số ${index + 1}`,
                  value: spec
                }))
              );
            }
                        } else if (typeof data.product.thong_so_ky_thuat === 'object') {
            // Convert object to array of title/value pairs
            setTechnicalSpecs(
              Object.entries(data.product.thong_so_ky_thuat).map(([key, value]) => ({
                title: key,
                value: typeof value === 'string' ? value : String(value)
              }))
            );
          } else if (typeof data.product.thong_so_ky_thuat === 'string') {
            // Split string by newlines and create title/value pairs
            const specs = data.product.thong_so_ky_thuat.split('\n').filter((line: string) => line.trim() !== '');
            setTechnicalSpecs(
              specs.map((spec: string, index: number) => {
                const parts = spec.split(':');
                if (parts.length > 1) {
                  return {
                    title: parts[0].trim(),
                    value: parts.slice(1).join(':').trim()
                  };
                }
                return {
                  title: `Thông số ${index + 1}`,
                  value: spec.trim()
                };
              })
            );
              }
            } else {
              // Set empty specs if none exist
              setTechnicalSpecs([]);
            }
          } catch (error) {
            console.error('Error processing product data:', error);
            // Set default empty values in case of errors
            setKeyFeatures([]);
            setBenefits([]);
            setInstructions([]);
            setOverview(data.product.description || '');
            setTechnicalSpecs([]);
          }
          
          // Gọi fetchSimilarProducts sau khi đã có product id
          if (data.product && data.product.id) {
            fetchSimilarProducts(data.product.id);
          }
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

  // Generate breadcrumb items
  const breadcrumbItems = generateBreadcrumbItems(
    `/san-pham/${product.slug}`, 
    product.name,
    product.category_name
  );

  // Generate FAQ data for this product
  const productFAQs = generateProductFAQs(
    product.name,
    product.category_name,
    product.brand
  );

  return (
    <>
      {/* SEO Components */}
      <SocialMetaTags
        title={`${product.name} | ${product.brand || 'G3'} | G3 - Công Thái Học`}
        description={`${product.name} - ${product.description?.slice(0, 100) || 'Sản phẩm công thái học chất lượng cao'} ✓ Giá tốt ✓ Bảo hành 12 tháng ✓ Miễn phí vận chuyển`}
        image={product.image_url || `${process.env.NEXT_PUBLIC_SITE_URL}/images/header-img.jpg`}
        url={`${process.env.NEXT_PUBLIC_SITE_URL}/san-pham/${product.slug}`}
        type="product"
        price={product.price.toString()}
        availability="InStock"
        brand={product.brand || 'G3'}
        category={product.category_name || 'Nội thất văn phòng'}
      />
      <LazyProductJsonLd 
        product={product}
        brand={product.brand ? { 
          id: product.brand_id, 
          title: product.brand,
          slug: product.brand_slug || '',
          created_at: ''
        } : undefined}
        reviews={comments.map(comment => ({
          id: comment.id,
          author: comment.user.name,
          rating: comment.rating,
          datePublished: comment.date,
          reviewBody: comment.content
        }))}
      />
      <LazyBreadcrumbJsonLd items={breadcrumbItems} />
      <LazyFAQJsonLd faqs={productFAQs} />
      
      {/* Mobile View */}
      <div className="md:hidden">
        <MobileShopeeProductDetail 
          product={product} 
          galleryImages={galleryImages}
          videoInfo={{
            videoUrl: video?.videoUrl || '',
            thumbnail: video?.thumbnail || ''
          }}
          comments={comments}
          ratingSummary={ratingSummary}
          technicalSpecs={technicalSpecs}
          keyFeatures={keyFeatures}
          benefits={benefits}
          instructions={instructions}
          overview={overview}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <ProductDetailDesktop 
          product={product}
          galleryImages={galleryImages}
          isLoadingGallery={isLoadingGallery}
          videoInfo={{
            videoUrl: video?.videoUrl || '',
            thumbnail: video?.thumbnail || ''
          }}
          comments={comments}
          ratingSummary={ratingSummary}
          similarProducts={similarProducts}
          loadingSimilar={loadingSimilar}
          technicalSpecs={technicalSpecs}
          keyFeatures={keyFeatures}
          benefits={benefits}
          instructions={instructions}
          overview={overview}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
        />
      </div>

      {/* Float Product Action */}
      <FloatProductAction 
        product={product} 
        selectedVariant={selectedVariant}
      />
    </>
  );
} 