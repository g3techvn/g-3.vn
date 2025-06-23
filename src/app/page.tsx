'use client';
import { useEffect, useState, useCallback, useRef, useMemo, Suspense, lazy } from 'react';
import { Product, Brand } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';

// Lazy loaded components
const HeroCarousel = lazy(() => import('@/components/pc/home/HeroCarousel'));
const CategorySection = lazy(() => import('@/components/pc/home/CategorySection'));
const CategoryGrid = lazy(() => import('@/components/pc/home/CategoryGrid'));
const FeaturedProducts = lazy(() => import('@/components/pc/product/FeaturedProducts'));
const ComboProduct = lazy(() => import('@/components/pc/product/ComboProduct'));
const NewProducts = lazy(() => import('@/components/pc/product/NewProducts'));
const BrandLogos = lazy(() => import('@/components/pc/home/BrandLogos'));
const BlogPosts = lazy(() => import('@/components/pc/home/BlogPosts'));
const SupportSection = lazy(() => import('@/components/pc/home/support'));
const MobileHomeHeader = lazy(() => import('@/components/mobile/MobileHomeHeader'));
const MobileHomeTabs = lazy(() => import('@/components/mobile/MobileHomeTabs'));
const MobileFeatureProduct = lazy(() => import('../components/mobile/MobileFeatureProduct'));
const MobileBestsellerProducts = lazy(() => import('../components/mobile/MobileBestsellerProducts'));
const HomeAdModal = lazy(() => import('../components/pc/common/HomeAdModal'));

// Non-lazy imports for SEO
import { FAQJsonLd } from '@/components/SEO/FAQJsonLd';
import { generalFAQs } from '@/lib/general-faqs';

// Fallback loading component
const LoadingFallback = () => (
  <div className="w-full py-20 flex items-center justify-center">
    <div className="skeleton-shimmer w-full h-48 rounded-lg bg-gray-200"></div>
  </div>
);

// Import or define ComboProduct type
interface ComboProduct extends Product {
  combo_products?: Product[];
}

// Store data by category to prevent reloading
interface CategoryData {
  products: Product[];
  brands: Brand[];
  isLoaded: boolean;
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 } 
  }
};

// Page loading overlay component
const PageLoadingOverlay = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            transition: { 
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1] 
            } 
          }}
        >
          <motion.div
            className="w-16 h-16 mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1],
              opacity: [0, 1, 1]
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path 
                d="M12 4L12 20" 
                stroke="#FF4444" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeDasharray="1 3"
              >
                <animate 
                  attributeName="stroke-dashoffset" 
                  values="0;4" 
                  dur="0.6s" 
                  repeatCount="indefinite"
                />
              </path>
              <path 
                d="M4 12L20 12" 
                stroke="#FF4444" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeDasharray="1 3"
              >
                <animate 
                  attributeName="stroke-dashoffset" 
                  values="0;4" 
                  dur="0.6s" 
                  repeatCount="indefinite"
                />
              </path>
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="#FF4444" 
                strokeWidth="2" 
                strokeLinecap="round"
                fill="none"
              >
                <animate 
                  attributeName="stroke-dasharray" 
                  values="0 63; 63 63" 
                  dur="1.5s" 
                  repeatCount="indefinite"
                />
                <animate 
                  attributeName="stroke-dashoffset" 
                  values="0; 63" 
                  dur="1.5s" 
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </motion.div>
          <motion.p
            className="text-gray-700 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Đang tải...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add a new function above the Home component
const fetchBatchData = async (endpoints: string[]) => {
  try {
    const responses = await Promise.all(
      endpoints.map(endpoint => fetch(endpoint))
    );
    
    const data = await Promise.all(
      responses.map(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
    );
    
    return data;
  } catch (error) {
    console.error('Error fetching batch data:', error);
    throw error;
  }
};

// Add this custom hook for better data caching
const useDataCache = <T,>(key: string, fetchFn: () => Promise<T>, dependencies: unknown[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef(new Map<string, {data: T, timestamp: number}>());
  
  const fetchData = useCallback(async () => {
    // Check cache first
    const cachedItem = cache.current.get(key);
    const now = Date.now();
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
    
    if (cachedItem && (now - cachedItem.timestamp < CACHE_TTL)) {
      setData(cachedItem.data);
      return;
    }
    
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      
      // Update cache
      cache.current.set(key, {
        data: result, 
        timestamp: now
      });
    } catch (err) {
      console.error(`Error fetching data for ${key}:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn]);
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...dependencies]);
  
  return { data, loading, error, refetch: fetchData };
};

export default function Home() {
  // State declarations
  const [isMobile, setIsMobile] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // Use the useProducts hook with different options for different sections
  const { products: allProducts, loading: loadingAllProducts } = useProducts();
  const { products: featuredProducts, loading: loadingFeatured } = useProducts({ type: 'featured' });
  const { products: newProducts, loading: loadingNew } = useProducts({ type: 'new' });
  const { products: comboProducts, loading: loadingCombo } = useProducts({ type: 'combo' });

  // Loading state combining all loading states
  const isLoading = loadingAllProducts || loadingFeatured || loadingNew || loadingCombo || loadingBrands;

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        if (!response.ok) throw new Error('Failed to fetch brands');
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch brands');
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Show ad modal after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAdModal(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen">
      <PageLoadingOverlay isVisible={isLoading} />
      
      {/* Mobile View */}
      {isMobile ? (
        <div className="space-y-4">
          <Suspense fallback={<LoadingFallback />}>
            <MobileHomeHeader />
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            <MobileHomeTabs />
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            <MobileFeatureProduct 
              products={featuredProducts}
              brands={brands}
              loading={loadingFeatured}
              error={error}
            />
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            <MobileBestsellerProducts 
              products={allProducts}
              loading={loadingAllProducts}
              error={error}
            />
          </Suspense>
        </div>
      ) : (
        /* Desktop View */
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-8"
        >
          <Suspense fallback={<LoadingFallback />}>
            <HeroCarousel />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <CategorySection />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <CategoryGrid />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <FeaturedProducts 
              products={featuredProducts}
              loading={loadingFeatured}
              error={error}
              brands={brands}
            />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <NewProducts 
              products={newProducts}
              loading={loadingNew}
              error={error}
              brands={brands}
            />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <ComboProduct 
              products={comboProducts}
              loading={loadingCombo}
              error={error}
              brands={brands}
            />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <BrandLogos 
              brands={brands}
              loading={loadingBrands}
              error={error}
            />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <BlogPosts />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <SupportSection />
          </Suspense>
        </motion.div>
      )}

      {/* Ad Modal */}
      <Suspense fallback={null}>
        {showAdModal && <HomeAdModal />}
      </Suspense>

      {/* FAQ Schema */}
      <FAQJsonLd faqs={generalFAQs} />
    </div>
  );
}
