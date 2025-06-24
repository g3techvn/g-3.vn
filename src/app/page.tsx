'use client';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Product, Brand } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';

// Direct imports instead of lazy loading
import HeroCarousel from '@/components/pc/home/HeroCarousel';
import CategorySection from '@/components/pc/home/CategorySection';
import ComboProduct from '@/components/pc/product/ComboProduct';
import NewProducts from '@/components/pc/product/NewProducts';
import SupportSection from '@/components/pc/home/support';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import MobileHomeTabs from '@/components/mobile/MobileHomeTabs';
import MobileFeatureProduct from '@/components/mobile/MobileFeatureProduct';
import MobileBestsellerProducts from '@/components/mobile/MobileBestsellerProducts';
import HomeAdModal from '../components/pc/common/HomeAdModal';

// Non-lazy imports for SEO
import { FAQJsonLd } from '@/components/SEO/FAQJsonLd';
import { generalFAQs } from '@/lib/general-faqs';

// Loading fallback component
const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
  </div>
);

// Error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Error caught by boundary:', error);
      setHasError(true);
      setError(error.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Vui lòng thử lại sau'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

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
  const [isMobile, setIsMobile] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);

  // Convert selected category slug to ID for API calls
  const selectedCategoryId = useMemo(() => {
    if (!selectedCategory || selectedCategory === '') return undefined;
    
    // Find the category from categories array
    const foundCategory = categories.find(cat => cat.slug === selectedCategory);
    return foundCategory?.id?.toString();
  }, [selectedCategory, categories]);

  // Mobile products (filtered by selected category)
  const { products: mobileFeatureProducts } = useProducts({ 
    type: 'mobilefeature',
    categoryId: selectedCategoryId
  });
  const { products: newProducts } = useProducts({ 
    type: 'new',
    categoryId: selectedCategoryId
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [brandsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/categories')
        ]);

        if (!brandsResponse.ok) throw new Error('Failed to fetch brands');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');

        const [brandsData, categoriesData] = await Promise.all([
          brandsResponse.json(),
          categoriesResponse.json()
        ]);

        setBrands(brandsData.brands || []);
        
        const formattedCategories = [
          { name: 'Tất cả', slug: '', id: null, productCount: 0 },
          ...(categoriesData.product_cats || []).map((cat: any) => ({
            name: cat.title,
            slug: cat.slug,
            id: cat.id,
            productCount: cat.product_count || 0
          }))
        ];
        
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchComboProducts = async () => {
      try {
        const response = await fetch('/api/combo-products');
        const data = await response.json();
        setComboProducts(data.comboItems || []);
      } catch (error) {
        console.error('Error fetching combo products:', error);
      }
    };

    fetchComboProducts();
  }, []);

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {isMobile ? (
          // Mobile view
          <div className="space-y-4">
            <MobileHomeHeader />
            <MobileHomeTabs
              categories={categories}
              onCategoryChange={handleCategoryChange}
            />
            <MobileFeatureProduct products={mobileFeatureProducts} brands={brands} />
            <MobileBestsellerProducts products={newProducts} />
          </div>
        ) : (
          // Desktop view
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <HeroCarousel />
            <CategorySection />
            <NewProducts products={newProducts} brands={brands} />
            {comboProducts.length > 0 && (
              <ComboProduct products={comboProducts} brands={brands} />
            )}
            <SupportSection />
            <HomeAdModal />
          </motion.div>
        )}
        <FAQJsonLd faqs={generalFAQs} />
      </div>
    </ErrorBoundary>
  );
}
