import Image from 'next/image';
import { useState, useEffect } from 'react';

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

  // Calculate quality based on device
  const imageQuality = quality || (isMobile ? 75 : 85);

  // Use smaller dimensions on mobile when width/height are provided
  const mobileScale = 0.75; // Scale factor for mobile
  const calculatedWidth = width ? (isMobile ? Math.round(width * mobileScale) : width) : undefined;
  const calculatedHeight = height ? (isMobile ? Math.round(height * mobileScale) : height) : undefined;

  return (
    <div 
      className={`relative ${className} ${!loaded ? 'bg-gray-100 animate-pulse' : ''}`}
      style={fill ? { width: '100%', height: '100%', ...style } : style}
    >
      <Image
        src={src}
        alt={alt}
        width={!fill ? calculatedWidth : undefined}
        height={!fill ? calculatedHeight : undefined}
        quality={imageQuality}
        priority={priority}
        fill={fill}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
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