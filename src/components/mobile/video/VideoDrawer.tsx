'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { VideoGallery } from './VideoGallery';
import { VideoProductInfo } from './VideoProductInfo';
import { VideoProductActions } from './VideoProductActions';
import { VideoProductReviews } from './VideoProductReviews';
import { VideoProductPolicies } from './VideoProductPolicies';
import { VideoTechnicalSpecs } from './VideoTechnicalSpecs';
import { ShareIcon } from '@heroicons/react/24/outline';
import { ImageItem } from '@/types/supabase';

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

  // Mock technical specifications
  const mockTechnicalSpecs = [
    { title: 'Chất liệu', value: 'Lưới cao cấp, khung thép' },
    { title: 'Kích thước', value: '65 x 65 x 110 cm' },
    { title: 'Trọng lượng', value: '25 kg' },
    { title: 'Màu sắc', value: 'Đen, Xám, Xanh' },
    { title: 'Bảo hành', value: '12 tháng' }
  ];

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
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {brandName && (
              <span className="text-sm text-gray-500">{brandName}</span>
            )}
          </div>
          <button
            onClick={handleShare}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <ShareIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Gallery */}
          <VideoGallery 
            images={galleryImages}
            isLoading={isLoadingGallery}
            productName={product.name}
          />

          {/* Product Info */}
          <VideoProductInfo 
            product={product}
            brandName={brandName}
          />

          {/* Technical Specifications */}
          <VideoTechnicalSpecs 
            specifications={mockTechnicalSpecs}
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