import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { motion, AnimatePresence } from 'framer-motion';

// Define YT types for YouTube Player API
interface YTPlayerEvent {
  target: { mute: () => void; playVideo: () => void };
}

interface YTOnStateChangeEvent {
  data: number;
}

interface YTPlayer {
  destroy(): void;
}

interface GalleryItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  videoUrl?: string;
}

interface ProductGalleryProps {
  productName: string;
  galleryItems: GalleryItem[];
  isLoadingGallery: boolean;
}

export function ProductGallery({ productName, galleryItems, isLoadingGallery }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<YTPlayer | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedIndex !== 0) return;
    // Handle YouTube Player API
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
    // Only attach when it's a video
    if (window.YT && videoRef.current) {
      currentPlayer = new window.YT.Player(videoRef.current, {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      setPlayer(currentPlayer);
    } else {
      // If YT isn't loaded yet, load the script
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || galleryItems[selectedIndex]?.type === 'video') return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    setMousePosition({ x, y });
  };

  return (
    <div>
      <motion.div 
        ref={containerRef}
        className="bg-gray-100 border-2 border-gray-200 rounded-lg overflow-hidden relative"
        style={{ aspectRatio: '16/9' }}
        onMouseEnter={() => galleryItems[selectedIndex]?.type === 'image' && setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Left arrow button */}
        <AnimatePresence>
          {selectedIndex > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
              onClick={() => setSelectedIndex(selectedIndex - 1)}
              aria-label="Previous image"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Display loading state or video/image content */}
        <AnimatePresence mode="wait">
          {isLoadingGallery ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="w-8 h-8 border-3 border-t-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="mt-4 text-sm text-gray-600">Đang tải ảnh sản phẩm...</span>
            </motion.div>
          ) : galleryItems.length > 0 && selectedIndex >= 0 && selectedIndex < galleryItems.length ? (
            galleryItems[selectedIndex].type === 'video' ? (
              <motion.div
                key={`video-${selectedIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <iframe
                  ref={videoRef}
                  id="product-video-yt"
                  width="100%"
                  height="100%"
                  src={`${galleryItems[selectedIndex].videoUrl}?enablejsapi=1&autoplay=1&mute=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              </motion.div>
            ) : (
              <motion.div
                key={`image-${selectedIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <div className="absolute inset-0">
                  <Image
                    src={galleryItems[selectedIndex].url}
                    alt={productName}
                    fill
                    className={`object-contain transition-transform duration-200 ${isZoomed ? 'scale-110' : ''}`}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority
                    style={
                      isZoomed 
                        ? { 
                            transformOrigin: `${mousePosition.x * 100}% ${mousePosition.y * 100}%` 
                          } 
                        : undefined
                    }
                  />
                </div>
              </motion.div>
            )
          ) : (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-red-500">Không có dữ liệu gallery hoặc index không hợp lệ</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right arrow button */}
        <AnimatePresence>
          {selectedIndex < galleryItems.length - 1 && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
              onClick={() => setSelectedIndex(selectedIndex + 1)}
              aria-label="Next image"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Thumbnails Gallery */}
      <div className="mt-4 flex overflow-x-auto gap-2 pb-2">
        {isLoadingGallery ? (
          <div className="flex items-center justify-center w-full py-4">
            <div className="w-5 h-5 border-2 border-t-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-gray-600">Đang tải ảnh...</span>
          </div>
        ) : (
          galleryItems.map((item, index) => {
            if (item.type === 'video') {
              return (
                <motion.div
                  key={`video-${index}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer flex items-center justify-center ${selectedIndex === index ? 'border-red-500' : 'border-gray-200'}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <Image
                    src={item.thumbnail || ''}
                    alt="Video thumbnail"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                  <motion.span 
                    className="absolute inset-0 flex items-center justify-center"
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="20" fill="rgba(0,0,0,0.5)" />
                      <polygon points="16,12 30,20 16,28" fill="white" />
                    </svg>
                  </motion.span>
                </motion.div>
              );
            } else {
              return (
                <motion.div
                  key={`image-${index}-${item.url}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${selectedIndex === index ? 'border-red-500' : 'border-gray-200'}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <Image
                    src={item.url}
                    alt={`${productName} - ${index}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </motion.div>
              );
            }
          })
        )}
      </div>
    </div>
  );
} 