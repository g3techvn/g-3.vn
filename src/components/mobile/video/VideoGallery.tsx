import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

// Gallery item types - match MobileShopeeProductDetail structure
type GalleryVideo = {
  type: 'video';
  url: string;
  embed: string;
  thumbnail: string;
  title: string;
};

type GalleryImage = {
  type: 'image';
  src: string;
  alt: string;
};

type GalleryItem = GalleryVideo | GalleryImage;

interface VideoGalleryProps {
  mainImageUrl?: string; // Main product image URL
  videoInfo?: {
    videoUrl: string;
    thumbnail: string;
  };
  galleryImages: string[]; // Additional gallery images
  isLoading: boolean;
  productName: string;
}

export function VideoGallery({ mainImageUrl, videoInfo, galleryImages, isLoading, productName }: VideoGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Create video object if videoInfo is provided
  const video: GalleryVideo | null = videoInfo ? {
    type: 'video',
    url: videoInfo.videoUrl,
    embed: videoInfo.videoUrl,
    thumbnail: videoInfo.thumbnail,
    title: `Video giới thiệu ${productName}`
  } : null;

  // Create gallery items array with proper structure
  const galleryItems: GalleryItem[] = [
    // First include main product image if available
    ...(mainImageUrl ? [{ 
      type: 'image' as const, 
      src: mainImageUrl, 
      alt: `${productName} - Ảnh chính` 
    }] : []),
    // Then include video if available
    ...(video ? [video] : []),
    // Then include gallery images (excluding main image to avoid duplication)
    ...galleryImages
      .filter(url => url !== mainImageUrl)
      .map((url, idx) => ({ 
        type: 'image' as const, 
        src: url, 
        alt: `${productName} - ${idx + 1}` 
      }))
  ];

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === galleryItems.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  };

  // Check if we have valid data
  const hasItems = galleryItems.length > 0;
  const currentItem = hasItems ? galleryItems[selectedImageIndex] : null;

  return (
    <div className="w-full flex flex-col items-center bg-white pb-2">
      {/* Main image or video */}
      <div className="relative w-full aspect-square max-w-full overflow-hidden border border-gray-200 bg-gray-50 mb-2">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-t-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="mt-4 text-sm text-gray-600">Đang tải ảnh sản phẩm...</span>
          </div>
        ) : hasItems && currentItem ? (
          currentItem.type === 'video' ? (
            <iframe
              src={`${currentItem.embed}?autoplay=1&mute=0&enablejsapi=1`}
              title={currentItem.title}
              allow="autoplay"
              allowFullScreen
              className="w-full h-full absolute inset-0 bg-black"
              style={{ aspectRatio: '1/1', minHeight: 200 }}
            />
          ) : (
            <>
              <Image
                src={currentItem.src}
                alt={currentItem.alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1}/{galleryItems.length}
              </div>
            </>
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-400">Không có ảnh sản phẩm</span>
          </div>
        )}

        {/* Navigation Buttons */}
        {galleryItems.length > 1 && hasItems && currentItem && currentItem.type !== 'video' && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasItems && (
        <div className="flex gap-2 overflow-x-auto px-2 w-full justify-start">
          {isLoading ? (
            <div className="flex items-center justify-center w-full py-4">
              <div className="w-5 h-5 border-2 border-t-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-600">Đang tải ảnh...</span>
            </div>
          ) : (
            galleryItems.map((item, idx) => (
              <div
                key={idx}
                className={`relative w-14 h-14 rounded-lg border-2 cursor-pointer flex-shrink-0 ${selectedImageIndex === idx ? 'border-red-500' : 'border-gray-200'}`}
                onClick={() => setSelectedImageIndex(idx)}
              >
                {item.type === 'video' ? (
                  <>
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="56px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <PlayCircleIcon className="w-7 h-7 text-white" />
                    </div>
                  </>
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover rounded-lg"
                    sizes="56px"
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 