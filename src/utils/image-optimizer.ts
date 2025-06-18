/**
 * Image Performance Analysis Utilities
 * Separate from the main OptimizedImage component for monitoring and analysis
 */

// Lazy load images with IntersectionObserver
export function createImageObserver(
  callback: (entries: IntersectionObserverEntry[]) => void
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px', // Start loading 50px before coming into view
    threshold: 0.01
  });
}

// Generate blur placeholder for images
export function generateBlurDataURL(width: number = 8, height: number = 8): string {
  // Simple 8x8 gray blur placeholder
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#blur)"/>
    </svg>
  `)}`;
}

// Critical image detection for hero/LCP images
export function identifyCriticalImages(): string[] {
  if (typeof window === 'undefined') return [];
  
  const criticalImages: string[] = [];
  
  // Find images in viewport on page load
  const images = document.querySelectorAll('img');
  images.forEach((img) => {
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.left < window.innerWidth) {
      criticalImages.push(img.src);
    }
  });
  
  return criticalImages;
}

// Resource timing analysis for slow images
export function analyzeImagePerformance(): {
  slowImages: Array<{
    url: string;
    loadTime: number;
    size: number;
  }>;
  totalImages: number;
  averageLoadTime: number;
} {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return { slowImages: [], totalImages: 0, averageLoadTime: 0 };
  }
  
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const imageEntries = entries.filter(entry => 
    entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i) ||
    entry.name.includes('_next/image')
  );
  
  const slowImages = imageEntries
    .filter(entry => entry.duration > 1000) // Slower than 1 second
    .map(entry => ({
      url: entry.name,
      loadTime: Math.round(entry.duration),
      size: entry.transferSize || 0
    }))
    .sort((a, b) => b.loadTime - a.loadTime);
  
  const averageLoadTime = imageEntries.length > 0
    ? imageEntries.reduce((sum, entry) => sum + entry.duration, 0) / imageEntries.length
    : 0;
  
  return {
    slowImages,
    totalImages: imageEntries.length,
    averageLoadTime: Math.round(averageLoadTime)
  };
}

// Batch image preloader for improved UX
export class ImagePreloader {
  private loadedImages: Set<string> = new Set();
  private loadingImages: Map<string, Promise<void>> = new Map();
  
  async preload(src: string): Promise<void> {
    if (this.loadedImages.has(src)) {
      return Promise.resolve();
    }
    
    if (this.loadingImages.has(src)) {
      return this.loadingImages.get(src)!;
    }
    
    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(src);
        this.loadingImages.delete(src);
        resolve();
      };
      img.onerror = () => {
        this.loadingImages.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
    
    this.loadingImages.set(src, promise);
    return promise;
  }
  
  async preloadBatch(sources: string[]): Promise<PromiseSettledResult<void>[]> {
    const promises = sources.map(src => this.preload(src));
    return Promise.allSettled(promises);
  }
  
  isLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }
  
  clear(): void {
    this.loadedImages.clear();
    this.loadingImages.clear();
  }
}

// Global image preloader instance
export const globalImagePreloader = new ImagePreloader(); 