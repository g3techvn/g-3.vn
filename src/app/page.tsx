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
const MobileCatogeryFeature = lazy(() => import('@/components/mobile/MobileCatogeryFeature'));

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

  // Lấy sản phẩm theo danh mục
  const fetchProductsByCategory = useCallback(async (categorySlug: string) => {
    if (!categorySlug) {
      setCategoryProducts(products);
      return;
    }
    
    // Check if we already have this category data cached
    if (categoryDataCache.current[categorySlug]?.isLoaded) {
      // Use cached data if available
      setCategoryProducts(categoryDataCache.current[categorySlug].products);
      return;
    }
    
    try {
      setLoadingCategoryProducts(true);
      setLoading(true);
      const url = `/api/categories/${categorySlug}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const categoryProducts = data.products || [];
      setCategoryProducts(categoryProducts);
      
      // Filter brands for this category
      const brandIdsInCategory = new Set(
        categoryProducts.map((product: Product) => product.brand_id).filter(Boolean)
      );
      
      const filteredBrands = brands.filter(brand => brandIdsInCategory.has(brand.id));
      
      // Cache this category's data
      categoryDataCache.current[categorySlug] = {
        products: categoryProducts,
        brands: filteredBrands,
        isLoaded: true
      };
    } catch (error: unknown) {
      console.error(`Error fetching products for category ${categorySlug}:`, error);
      setCategoryProducts([]);
    } finally {
      setLoading(false);
      setLoadingCategoryProducts(false);
    }
  }, [products, brands]);

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

  // Fetch combo products
  const fetchComboProducts = useCallback(async () => {
    // Don't fetch if already loaded or error occurred
    if (comboProducts.length > 0 || comboError) return;
    
    try {
      setLoadingCombo(true);
      const MAX_PRODUCTS = 8;
      const response = await fetch(`/api/products?type=combo&limit=${MAX_PRODUCTS}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setComboProducts((data.products || []).slice(0, MAX_PRODUCTS) as ComboProduct[]);
    } catch (error: unknown) {
      console.error('Error fetching combo products:', error);
      setComboError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải combo sản phẩm');
    } finally {
      setLoadingCombo(false);
    }
  }, [comboProducts.length, comboError]);

  // Handle category change from tab click
  const handleCategoryChange = useCallback((categorySlug: string) => {
    isManualCategoryChange.current = true;
    setSelectedCategory(categorySlug);
  }, []);

  // Xử lý khi danh mục thay đổi
  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      setCategoryProducts(products);
    }
  }, [selectedCategory, products, fetchProductsByCategory]);

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

  // Initial data fetch - only run once
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // First load essential data
        await Promise.all([
          fetchBrands(),
          fetchCategories()
        ]);
        
        // Products are loaded by the useProducts hook
        // No need to fetch products explicitly
        
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
  }, [fetchBrands, fetchCategories]); 

  // Set up Intersection Observer for lazy loading
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [id]: true }));
          
          // Lazy load data when section becomes visible
          if (id === 'featured' && !featuredProducts.length) {
            fetchFeaturedProducts();
          } else if (id === 'combo' && !comboProducts.length) {
            fetchComboProducts();
          } else if (id === 'new' && !newProducts.length) {
            fetchNewProducts();
          }
        }
      });
    }, observerOptions);
    
    // Register all sections for observation
    const sections = document.querySelectorAll('.lazy-section');
    sections.forEach(section => {
      sectionObserver.observe(section);
    });
    
    return () => {
      sectionObserver.disconnect();
    };
  }, [
    fetchFeaturedProducts,
    fetchComboProducts,
    fetchNewProducts,
    featuredProducts.length,
    comboProducts.length,
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

  // Memoize các props truyền xuống MobileCategoryFeature để tránh re-render
  const mobileCategoryFeatureProps = useMemo(() => ({
    brands: getCurrentCategoryBrands,
    loading: !!(loadingBrands || loadingCategoryProducts),
    error: brandError,
    categorySlug: selectedCategory
  }), [getCurrentCategoryBrands, loadingBrands, loadingCategoryProducts, brandError, selectedCategory]);

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
                <Suspense fallback={<LoadingFallback />}>
                  <MobileCatogeryFeature {...mobileCategoryFeatureProps} />
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
