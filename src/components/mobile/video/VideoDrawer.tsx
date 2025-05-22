'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { VideoGallery } from './VideoGallery';
import { VideoProductInfo } from './VideoProductInfo';
import { VideoProductActions } from './VideoProductActions';
import { VideoProductReviews } from './VideoProductReviews';
import { VideoProductPolicies } from './VideoProductPolicies';
import { VideoTechnicalSpecs } from './VideoTechnicalSpecs';
import { ShareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ImageItem } from '@/types/supabase';
import { VideoDescription } from './VideoDescription';

interface VideoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  brandName?: string;
}

export function VideoDrawer({ isOpen, onClose, product, brandName }: VideoDrawerProps) {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Mock data for reviews
  const mockComments = [
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
  ];

  const mockRatingSummary = {
    average: product.rating || 4.1,
    total: 394168,
    stars: [
      { star: 5, count: 300000 },
      { star: 4, count: 60000 },
      { star: 3, count: 20000 },
      { star: 2, count: 8000 },
      { star: 1, count: 6200 },
    ]
  };

  // Extract and format technical specifications from product data
  const formatSpecifications = () => {
    if (!product.thong_so_ky_thuat) return [];
    
    // Use a Map to ensure unique specification names
    const specsMap = new Map();
    Object.entries(product.thong_so_ky_thuat).forEach(([key, spec]) => {
      const name = spec.title || key;
      specsMap.set(name, {
        name: name,
        value: spec.value || ''
      });
    });
    
    return Array.from(specsMap.values());
  };

  useEffect(() => {
    const fetchGalleryImages = async () => {
      if (!product.gallery_url) {
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

    if (isOpen) {
      fetchGalleryImages();
    }
  }, [isOpen, product.gallery_url]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link vào clipboard!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto w-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border- font-bold border-gray-200 px-4 py-3 flex items-center justify-between w-full">
          <div className="flex items-center">
            <span className="text-red-600">Sản phẩm</span>
            {brandName && (
              <span className="text-sm text-red-600 mx-1">{brandName}</span>
            )}
            <span className="text-red-600">chính hãng</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <ShareIcon className="h-6 w-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 ml-1"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="">
          {/* Gallery */}
          <VideoGallery 
            mainImageUrl={product.image_url}
            galleryImages={galleryImages}
            videoInfo={product.video_url ? {
              videoUrl: `https://www.youtube.com/embed/${extractYouTubeId(product.video_url)}`,
              thumbnail: `https://img.youtube.com/vi/${extractYouTubeId(product.video_url)}/hqdefault.jpg`
            } : undefined}
            isLoading={isLoadingGallery}
            productName={product.name}
          />

          {/* Product Info */}
          <div className="px-4">
          <VideoProductInfo 
            product={product}
            brandName={brandName}
          />
          </div>

          {/* Description */}
          <VideoDescription description={product.description} />

          {/* Technical Specifications */}
          <VideoTechnicalSpecs 
            specifications={formatSpecifications()}
          />

          {/* Product Policies */}
          <VideoProductPolicies />

          {/* Product Reviews */}
          <VideoProductReviews 
            comments={mockComments}
            ratingSummary={mockRatingSummary}
          />

          {/* Action Buttons */}
          <VideoProductActions 
            productPrice={product.price as number}
            onAddToCart={() => {
              // TODO: Implement add to cart
              console.log('Add to cart:', product);
            }}
            onBuyNow={() => {
              // TODO: Implement buy now
              console.log('Buy now:', product);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function extractYouTubeId(url?: string): string {
  if (!url) return '';
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : '';
} 