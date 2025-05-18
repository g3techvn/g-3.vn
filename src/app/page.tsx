'use client';
import { useEffect, useState, useCallback, useRef, useMemo, Suspense, lazy } from 'react';
import { Product, Brand } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useDomain } from '@/context/domain-context';

// Lazy loaded components
const HeroCarousel = lazy(() => import('@/components/pc/home/HeroCarousel'));
const CategoryGrid = lazy(() => import('@/components/pc/home/CategoryGrid'));
const FeaturedProducts = lazy(() => import('@/components/pc/product/FeaturedProducts'));
const ComboProduct = lazy(() => import('@/components/pc/product/ComboProduct'));
const NewProducts = lazy(() => import('@/components/pc/product/NewProducts'));
const BrandLogos = lazy(() => import('@/components/pc/home/BrandLogos'));
const BlogPosts = lazy(() => import('@/components/pc/home/BlogPosts'));
const MobileHomeHeader = lazy(() => import('@/components/mobile/MobileHomeHeader'));
const MobileHomeTabs = lazy(() => import('@/components/mobile/MobileHomeTabs'));
const MobileFeatureProduct = lazy(() => import('@/components/mobile/MobileFeatureProduct'));
const MobileBestsellerProducts = lazy(() => import('@/components/mobile/MobileBestsellerProducts'));

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
    transition: { type: 'spring', stiffness: 300, damping: 24 }
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
const useDataCache = <T,>(key: string, fetchFn: () => Promise<T>, dependencies: any[] = []) => {
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
  }, [fetchData, ...dependencies]);
  
  return { data, loading, error, refetch: fetchData };
};

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string; productCount: number }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // New states for component-specific data
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingCombo, setLoadingCombo] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [newError, setNewError] = useState<string | null>(null);
  const [comboError, setComboError] = useState<string | null>(null);
  
  // Animation states
  const [pageLoaded, setPageLoaded] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Track if initial data has loaded
  const initialLoadComplete = useRef(false);
  // Track if manual category change
  const isManualCategoryChange = useRef(false);
  // Track if category products are loading
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);
  // Cache for category data to prevent reloads
  const categoryDataCache = useRef<Record<string, CategoryData>>({});
  
  // Tracking visible sections for lazy loading
  const [visibleSections, setVisibleSections] = useState({
    hero: false,
    categories: false,
    featured: false,
    combo: false,
    new: false,
    brands: false,
    blog: false
  });

  // Use the useProducts hook to get domain-aware products
  const { products: useProductsProducts, loading: productsLoading, error: productsError, refresh: refreshProducts } = useProducts();

  // Lấy sector info
  const { sectorId, isLocalhost } = useDomain();

  // Update the existing useEffect that calls fetchProducts to use our new hook's data
  useEffect(() => {
    if (useProductsProducts.length > 0 && !initialLoadComplete.current) {
      setLoading(false);
      setProducts(useProductsProducts);
      initialLoadComplete.current = true;
      console.log('Products loaded:', useProductsProducts.length);
    }
  }, [useProductsProducts]);

  // Lấy tất cả thương hiệu
  const fetchBrands = useCallback(async () => {
    try {
      setLoadingBrands(true);
      const url = '/api/brands';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error: unknown) {
      console.error('Error fetching brands:', error);
      setBrandError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải thương hiệu');
    } finally {
      setLoadingBrands(false);
    }
  }, []);

  // Replace fetchProductsByCategory with our custom hook
  const fetchCategoryProducts = useCallback(async (categorySlug: string) => {
    if (!categorySlug) return [];
    const url = `/api/categories/${categorySlug}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    return data.products || [];
  }, []);
  
  // Use our custom hook for category data
  const { 
    data: currentCategoryProducts, 
    loading: currentCategoryLoading,
    error: currentCategoryError 
  } = useDataCache<Product[]>(
    `category-${selectedCategory}`,
    () => fetchCategoryProducts(selectedCategory),
    [selectedCategory]
  );
  
  // Update state when the cached data changes
  useEffect(() => {
    if (currentCategoryProducts) {
      setCategoryProducts(currentCategoryProducts);
      setLoading(currentCategoryLoading);
      if (currentCategoryError) {
        setError(currentCategoryError);
      }
    }
  }, [currentCategoryProducts, currentCategoryLoading, currentCategoryError]);

  // Lấy tất cả danh mục và đếm sản phẩm
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      
      // Build URL with query parameters for categories
      const url = new URL('/api/categories', window.location.origin);
      if (sectorId && !isLocalhost) {
        url.searchParams.append('sector_id', sectorId);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const cats = data.product_cats || [];
      
      // Fetch số lượng sản phẩm cho mỗi danh mục
      const categoriesWithProductCount = await Promise.all(
        cats.map(async (cat: { title: string; slug: string }) => {
          try {
            // Build URL with sector_id if available
            const url = new URL(`/api/categories/${cat.slug}`, window.location.origin);
            if (sectorId && !isLocalhost) {
              url.searchParams.append('sector_id', sectorId);
            }
            
            const prodResponse = await fetch(url.toString());
            if (!prodResponse.ok) return { ...cat, productCount: 0 };
            
            const prodData = await prodResponse.json();
            const count = prodData.products?.length || 0;
            
            // Cache initial category data to prevent future reloads
            if (count > 0) {
              categoryDataCache.current[cat.slug] = {
                products: prodData.products || [],
                brands: [], // We'll populate this later
                isLoaded: true
              };
            }
            
            return { 
              name: cat.title, 
              slug: cat.slug, 
              productCount: count 
            };
          } catch (error) {
            // console.error(`Error counting products for ${cat.slug}:`, error);
            return { name: cat.title, slug: cat.slug, productCount: 0 };
          }
        })
      );
      
      // Lọc và sắp xếp danh mục theo số lượng sản phẩm
      const filteredCategories = categoriesWithProductCount
        .filter(cat => cat.productCount > 0)
        .sort((a, b) => b.productCount - a.productCount);
      
      setCategories(filteredCategories);
      
      // Thiết lập danh mục mặc định là danh mục đầu tiên chỉ khi chưa có selectedCategory
      if (filteredCategories.length > 0 && !selectedCategory && !initialLoadComplete.current) {
        const firstCategorySlug = filteredCategories[0].slug;
        setSelectedCategory(firstCategorySlug);
        
        // If we already fetched this category's data, use it immediately
        if (categoryDataCache.current[firstCategorySlug]?.isLoaded) {
          setCategoryProducts(categoryDataCache.current[firstCategorySlug].products);
        }
      }
    } catch (error: unknown) {
      // console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [selectedCategory, sectorId, isLocalhost]);

  // Fetch featured products
  const fetchFeaturedProducts = useCallback(async () => {
    // Don't fetch if already loaded or error occurred
    if (featuredProducts.length > 0 || featuredError) return;
    
    try {
      setLoadingFeatured(true);
      const MAX_PRODUCTS = 8;
      const response = await fetch(`/api/products?sort=featured:desc&limit=${MAX_PRODUCTS}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setFeaturedProducts((data.products || []).slice(0, MAX_PRODUCTS));
    } catch (error: unknown) {
      console.error('Error fetching featured products:', error);
      setFeaturedError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm nổi bật');
    } finally {
      setLoadingFeatured(false);
    }
  }, [featuredProducts.length, featuredError]);

  // Fetch new products
  const fetchNewProducts = useCallback(async () => {
    // Don't fetch if already loaded or error occurred
    if (newProducts.length > 0 || newError) return;
    
    try {
      setLoadingNew(true);
      const MAX_PRODUCTS = 12;
      const response = await fetch(`/api/products?sort=created_at:desc&limit=${MAX_PRODUCTS}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setNewProducts((data.products || []).slice(0, MAX_PRODUCTS));
    } catch (error: unknown) {
      console.error('Error fetching new products:', error);
      setNewError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm mới');
    } finally {
      setLoadingNew(false);
    }
  }, [newProducts.length, newError]);

  // Use our cache hook for combo products
  const { 
    data: cachedComboProducts, 
    loading: comboProductsLoading, 
    error: comboProductsError 
  } = useDataCache<ComboProduct[]>(
    'combo-products',
    async () => {
      const MAX_PRODUCTS = 8;
      const response = await fetch(`/api/products?type=combo&limit=${MAX_PRODUCTS}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      return (data.products || []).slice(0, MAX_PRODUCTS) as ComboProduct[];
    },
    []
  );
  
  // Update state when the cached combo products change
  useEffect(() => {
    if (cachedComboProducts) {
      setComboProducts(cachedComboProducts);
      setLoadingCombo(comboProductsLoading);
      if (comboProductsError) {
        setComboError(comboProductsError);
      }
    }
  }, [cachedComboProducts, comboProductsLoading, comboProductsError]);

  // Handle category change from tab click
  const handleCategoryChange = useCallback((categorySlug: string) => {
    isManualCategoryChange.current = true;
    setSelectedCategory(categorySlug);
  }, []);

  // Xử lý khi danh mục thay đổi
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryProducts(selectedCategory);
    } else {
      setCategoryProducts(products);
    }
  }, [selectedCategory, products, fetchCategoryProducts]);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Replace the initial data fetch with a batched approach
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Batch API calls for initial core data
        const endpoints = [
          '/api/brands',
          '/api/categories',
          '/api/products?sort=featured:desc&limit=8',
          '/api/products?sort=created_at:desc&limit=12'
        ];
        
        const [brandsData, categoriesData, featuredData, newProductsData] = await fetchBatchData(endpoints);
        
        // Set data from batch response
        setBrands(brandsData.brands || []);
        
        const cats = categoriesData.product_cats || [];
        // Process categories with product counts
        const categoriesWithProductCount = cats.map((cat: { title: string; slug: string }) => ({
          name: cat.title,
          slug: cat.slug,
          productCount: 0 // We'll fetch counts in a separate step if needed
        }));
        
        setCategories(categoriesWithProductCount);
        setFeaturedProducts((featuredData.products || []).slice(0, 8));
        setNewProducts((newProductsData.products || []).slice(0, 12));
        
        // Set loading states
        setLoadingBrands(false);
        setLoadingCategories(false);
        setLoadingFeatured(false);
        setLoadingNew(false);
        
        // Animation and page transitions
        setTimeout(() => {
          setPageLoaded(true);
          // Hide loading overlay
          setTimeout(() => {
            setInitialLoading(false);
          }, 300);
        }, 300);
      } catch (error) {
        console.error("Error loading initial data:", error);
        setInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, []); 

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '200px', // Increased margin to load earlier
      threshold: 0.1,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [id]: true }));
          
          // Section is visible - combo products will load via the cache hook
          
          // Once observed, unobserve the section to prevent additional fetches
          sectionObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Register all sections for observation
    const sections = document.querySelectorAll('.lazy-section');
    sections.forEach(section => {
      const sectionId = section.id;
      // Skip observing sections that already have data
      if ((sectionId === 'featured' && featuredProducts.length > 0) ||
          (sectionId === 'new' && newProducts.length > 0) ||
          (sectionId === 'combo' && comboProducts.length > 0)) {
        return;
      }
      sectionObserver.observe(section);
    });
    
    return () => {
      sectionObserver.disconnect();
    };
  }, [
    comboProducts.length,
    featuredProducts.length,
    newProducts.length
  ]);

  // Handle scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollElements = document.querySelectorAll('.scroll-trigger');
      
      scrollElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isInView = (rect.top <= window.innerHeight * 0.75) && (rect.bottom >= 0);
        
        if (isInView) {
          element.classList.add('scroll-animate');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Trigger once on load
    setTimeout(handleScroll, 500);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get relevant brands for current category from cache
  const getCurrentCategoryBrands = useMemo(() => {
    // If loading or no category selected, return all brands
    if (loadingCategoryProducts || !selectedCategory) {
      return brands;
    }
    
    // If we have cached data for this category, use the filtered brands
    if (categoryDataCache.current[selectedCategory]?.isLoaded) {
      // If we have cached brands and they're not empty, use them
      const cachedBrands = categoryDataCache.current[selectedCategory].brands;
      if (cachedBrands.length > 0) {
        return cachedBrands;
      }
      
      // Otherwise, filter brands based on products and update cache
      const products = categoryDataCache.current[selectedCategory].products;
      const brandIdsInCategory = new Set(
        products.map((product: Product) => product.brand_id).filter(Boolean)
      );
      
      const filteredBrands = brands.filter(brand => brandIdsInCategory.has(brand.id));
      
      // Update cache with filtered brands
      categoryDataCache.current[selectedCategory].brands = filteredBrands;
      
      return filteredBrands;
    }
    
    // Fallback: filter brands based on current category products
    if (categoryProducts.length > 0) {
      const brandIdsInCategory = new Set(
        categoryProducts.map((product: Product) => product.brand_id).filter(Boolean)
      );
      
      return brands.filter(brand => brandIdsInCategory.has(brand.id));
    }
    
    return brands;
  }, [brands, selectedCategory, categoryProducts, loadingCategoryProducts]);

  // Memoize các props truyền xuống MobileFeatureProduct để tránh re-render
  const mobileFeatureProductProps = useMemo(() => ({
    products: categoryProducts,
    brands,
    loading: loading,
    error: error
  }), [categoryProducts, brands, loading, error]);

  // Memoize các props truyền xuống MobileBestsellerProducts để tránh re-render
  const mobileBestsellerProps = useMemo(() => ({
    products: categoryProducts,
    loading: loading,
    error: error
  }), [categoryProducts, loading, error]);

  // Add a CSS class for page transitions
  useEffect(() => {
    document.body.classList.add('smooth-transition');
    return () => {
      document.body.classList.remove('smooth-transition');
    };
  }, []);

  return (
    <>
      <PageLoadingOverlay isVisible={initialLoading} />
      
      {isMobile ? (
        <AnimatePresence>
          <motion.div 
            className="bg-gray-50 min-h-screen"
            initial="hidden"
            animate={pageLoaded ? "visible" : "hidden"}
            variants={fadeIn}
          >
            <Suspense fallback={<LoadingFallback />}>
              <MobileHomeHeader />
            </Suspense>
            
            <Suspense fallback={<LoadingFallback />}>
              <MobileHomeTabs 
                categories={categories}
                loading={loadingCategories}
                onCategoryChange={handleCategoryChange} 
              />
            </Suspense>
            
            <motion.div variants={staggerContainer} className="scroll-trigger">
              {/* Section: Sản phẩm bán chạy */}
              <motion.div variants={slideUp}>
                <Suspense fallback={<LoadingFallback />}>
                  <MobileBestsellerProducts {...mobileBestsellerProps} />
                </Suspense>
              </motion.div>
            </motion.div>
            
            <motion.div variants={staggerContainer} className="scroll-trigger">
              <motion.div variants={slideUp}>
                {/* Được đề xuất cho bạn */}
                <Suspense fallback={<LoadingFallback />}>
                  <MobileFeatureProduct {...mobileFeatureProductProps} />
                </Suspense>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <AnimatePresence>
          <motion.div 
            className="min-h-screen pb-20"
            initial="hidden"
            animate={pageLoaded ? "visible" : "hidden"}
            variants={fadeIn}
          >
            {/* Hero Section */}
            <motion.div variants={slideUp} className="scroll-trigger lazy-section" id="hero">
              <Suspense fallback={<LoadingFallback />}>
                <HeroCarousel />
              </Suspense>
            </motion.div>

            {/* Category Grid */}
            <motion.div variants={slideUp} className="scroll-trigger lazy-section" id="categories">
              <Suspense fallback={<LoadingFallback />}>
                <CategoryGrid />
              </Suspense>
            </motion.div>

            {/* Featured Products */}
            <motion.div variants={staggerContainer} className="scroll-trigger lazy-section" id="featured">
              <motion.div variants={slideUp}>
                <Suspense fallback={<LoadingFallback />}>
                  {(visibleSections.featured || featuredProducts.length > 0) && (
                    <FeaturedProducts 
                      products={featuredProducts} 
                      loading={loadingFeatured} 
                      error={featuredError}
                      brands={brands}
                    />
                  )}
                </Suspense>
              </motion.div>
            </motion.div>

            {/* Combo Product */}
            <motion.div variants={staggerContainer} className="scroll-trigger lazy-section" id="combo">
              <motion.div variants={slideUp}>
                <Suspense fallback={<LoadingFallback />}>
                  {(visibleSections.combo || comboProducts.length > 0) && (
                    <ComboProduct 
                      products={comboProducts} 
                      loading={loadingCombo} 
                      error={comboError}
                      brands={brands}
                    />
                  )}
                </Suspense>
              </motion.div>
            </motion.div>

            {/* New Products */}
            <motion.div variants={staggerContainer} className="scroll-trigger lazy-section" id="new">
              <motion.div variants={slideUp}>
                <Suspense fallback={<LoadingFallback />}>
                  {(visibleSections.new || newProducts.length > 0) && (
                    <NewProducts 
                      products={newProducts} 
                      loading={loadingNew} 
                      error={newError}
                      brands={brands}
                    />
                  )}
                </Suspense>
              </motion.div>
            </motion.div>

            {/* Brands */}
            <motion.div variants={staggerContainer} className="scroll-trigger lazy-section" id="brands">
              <motion.div variants={slideUp}>
                <Suspense fallback={<LoadingFallback />}>
                  <BrandLogos 
                    brands={brands} 
                    loading={loadingBrands} 
                    error={brandError} 
                  />
                </Suspense>
              </motion.div>
            </motion.div>

            {/* Blog Posts */}
            <motion.div variants={staggerContainer} className="scroll-trigger lazy-section" id="blog">
              <motion.div variants={slideUp}>
                <Suspense fallback={<LoadingFallback />}>
                  <BlogPosts />
                </Suspense>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
