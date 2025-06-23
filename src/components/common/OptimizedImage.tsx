import Image from 'next/image';
import { useState, useEffect } from 'react';
import { generateProductAltTag } from '@/lib/utils/seo-utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  // Enhanced options for performance
  enablePreload?: boolean;
  optimizeForSlowNetwork?: boolean;
  // SEO enhancements
  productName?: string;
  category?: string;
  brand?: string;
  seoOptimized?: boolean;
  imageType?: 'main' | 'gallery' | 'thumbnail' | 'detail';
  features?: string[];
  color?: string;
  material?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  quality,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  style,
  objectFit = 'cover',
  enablePreload = false,
  optimizeForSlowNetwork = true,
  productName,
  category,
  brand,
  seoOptimized = true,
  imageType = 'main',
  features,
  color,
  material,
}: OptimizedImageProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Detect mobile on client side
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate quality based on device, priority, and network optimization
  const baseQuality = optimizeForSlowNetwork 
    ? (priority ? (isMobile ? 70 : 80) : (isMobile ? 50 : 60))
    : (priority ? (isMobile ? 80 : 90) : (isMobile ? 70 : 80));
  
  const imageQuality = quality || baseQuality;

  // Generate SEO-optimized alt text using advanced utilities
  const optimizedAlt = (() => {
    if (!seoOptimized) return alt;
    
    // Use advanced SEO utilities if product data is available
    if (productName) {
      return generateProductAltTag({
        name: productName,
        category,
        brand,
        features,
        color,
        material,
      }, imageType);
    }
    
    // Fallback to basic alt text generation
    if (category) {
      return `${category} chất lượng cao | G3 - Công Thái Học`;
    }
    
    return alt || 'Sản phẩm G3 - Nội thất công thái học';
  })();

  // Use smaller dimensions on mobile when width/height are provided
  const mobileScale = 0.75; // Scale factor for mobile
  const calculatedWidth = width ? (isMobile ? Math.round(width * mobileScale) : width) : undefined;
  const calculatedHeight = height ? (isMobile ? Math.round(height * mobileScale) : height) : undefined;

  // Enhanced URL optimization for Supabase images
  const optimizedSrc = (() => {
    // Handle Next.js optimized images - let Next.js handle optimization
    if (src.startsWith('/_next/image')) {
      return src;
    }
    
    // For Supabase images, optimize URL parameters
    if (src.includes('jjraznkvgfsgqrqvlcwo.supabase.co')) {
      try {
        const url = new URL(src);
        
        // Add quality parameter (optimized for slow loading)
        url.searchParams.set('quality', imageQuality.toString());
        
        // Add width parameter for responsive loading
        if (calculatedWidth) {
          url.searchParams.set('width', calculatedWidth.toString());
        }
        
        // Add format parameter for modern browsers
        if (typeof window !== 'undefined') {
          const canvas = document.createElement('canvas');
          if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
            url.searchParams.set('f', 'webp');
          }
        }
        
        return url.toString();
      } catch (error) {
        // If URL parsing fails, return original src
        return src;
      }
    }
    
    return src;
  })();

  // Preload critical images for LCP optimization
  useEffect(() => {
    if (enablePreload && priority && typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedSrc;
      document.head.appendChild(link);
      
      return () => {
        // Cleanup preload link when component unmounts
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [enablePreload, priority, optimizedSrc]);

  return (
    <div 
      className={`relative ${className} ${!loaded ? 'bg-gray-100 animate-pulse' : ''}`}
      style={fill ? { width: '100%', height: '100%', ...style } : style}
    >
      <Image
        src={optimizedSrc}
        alt={optimizedAlt}
        width={!fill ? calculatedWidth : undefined}
        height={!fill ? calculatedHeight : undefined}
        quality={imageQuality}
        priority={priority}
        fill={fill}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)} // Show content even if image fails
        style={{ 
          objectFit, 
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          ...(!fill && {width: '100%', height: 'auto'})
        }}
      />
    </div>
  );
} 