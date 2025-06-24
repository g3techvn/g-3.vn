'use client';
import { useEffect, useState, useCallback, useRef, useMemo, Suspense, lazy } from 'react';
import { Product, Brand } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';

// Lazy loaded components
const HeroCarousel = lazy(() => import('@/components/pc/home/HeroCarousel'));
const CategorySection = lazy(() => import('@/components/pc/home/CategorySection'));
const FeaturedProducts = lazy(() => import('@/components/pc/product/FeaturedProducts'));
const ComboProduct = lazy(() => import('@/components/pc/product/ComboProduct'));
const NewProducts = lazy(() => import('@/components/pc/product/NewProducts'));
const SupportSection = lazy(() => import('@/components/pc/home/support'));
const MobileHomeHeader = lazy(() => import('@/components/mobile/MobileHomeHeader'));
const MobileHomeTabs = lazy(() => import('@/components/mobile/MobileHomeTabs'));
const MobileFeatureProduct = lazy(() => import('@/components/mobile/MobileFeatureProduct'));
const MobileBestsellerProducts = lazy(() => import('@/components/mobile/MobileBestsellerProducts'));
const HomeAdModal = lazy(() => import('../components/pc/common/HomeAdModal'));

// Non-lazy imports for SEO
import { FAQJsonLd } from '@/components/SEO/FAQJsonLd';
import { generalFAQs } from '@/lib/general-faqs';

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

  // Convert selected category slug to ID for API calls
  const selectedCategoryId = useMemo(() => {
    if (!selectedCategory || selectedCategory === '') return undefined;
    
    // Find the category from categories array
    const foundCategory = categories.find(cat => cat.slug === selectedCategory);
    return foundCategory?.id?.toString();
  }, [selectedCategory, categories]);

  // Desktop products (not filtered by category)
  const { products: comboProducts } = useProducts({ type: 'combo' });
  
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
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        if (!response.ok) throw new Error('Failed to fetch brands');
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        
        // Format categories for MobileHomeTabs - API returns product_cats
        const formattedCategories = [
          { name: 'Tất cả', slug: '', id: null, productCount: 0 },
          ...(data.product_cats || []).map((cat: any) => ({
            name: cat.title,
            slug: cat.slug,
            id: cat.id,
            productCount: cat.product_count || 0
          }))
        ];
        
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
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

  return (
    <>
      <FAQJsonLd faqs={generalFAQs} />
      
      {/* Desktop View */}
      {!isMobile && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 space-y-8"
        >
          <Suspense fallback={null}>
            <HeroCarousel />
          </Suspense>

          <Suspense fallback={null}>
            <CategorySection />
          </Suspense>

          <Suspense fallback={null}>
            <ComboProduct 
              products={comboProducts} 
              brands={brands}
            />
          </Suspense>

          <Suspense fallback={null}>
            <NewProducts 
              products={newProducts} 
              brands={brands}
            />
          </Suspense>

          <Suspense fallback={null}>
            <SupportSection />
          </Suspense>
        </motion.div>
      )}

      {/* Mobile View */}
      {isMobile && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          <Suspense fallback={null}>
            <MobileHomeHeader />
          </Suspense>

          <Suspense fallback={null}>
            <MobileHomeTabs 
              categories={categories}
              onCategoryChange={handleCategoryChange}
            />
          </Suspense>

          <Suspense fallback={null}>
            <MobileBestsellerProducts 
              products={newProducts} 
            />
          </Suspense>

          <Suspense fallback={null}>
            <MobileFeatureProduct 
              products={mobileFeatureProducts} 
              brands={brands}
            />
          </Suspense>
        </motion.div>
      )}

      {/* Ad Modal */}
      <Suspense fallback={null}>
        <HomeAdModal />
      </Suspense>
    </>
  );
}
