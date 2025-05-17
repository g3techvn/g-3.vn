'use client';
import HeroCarousel from '@/components/pc/home/HeroCarousel';
import CategoryGrid from '@/components/pc/home/CategoryGrid';
import NewProducts from '@/components/pc/product/NewProducts';
import BlogPosts from '@/components/pc/home/BlogPosts';
import BrandLogos from '@/components/pc/home/BrandLogos';
import FeaturedProducts from '@/components/pc/product/FeaturedProducts';
import ComboProduct from '@/components/pc/product/ComboProduct';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import MobileHomeTabs from '@/components/mobile/MobileHomeTabs';
import { Product, Brand } from '@/types';
import MobileFeatureProduct from '@/components/mobile/MobileFeatureProduct';
import MobileBestsellerProducts from '@/components/mobile/MobileBestsellerProducts';
import MobileCatogeryFeature from '@/components/mobile/MobileCatogeryFeature';

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
  
  // Track if initial data has loaded
  const initialLoadComplete = useRef(false);
  // Track if manual category change
  const isManualCategoryChange = useRef(false);
  // Track if category products are loading
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);
  // Cache for category data to prevent reloads
  const categoryDataCache = useRef<Record<string, CategoryData>>({});

  // Lấy tất cả sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = '/api/products';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Lấy tất cả thương hiệu
  const fetchBrands = async () => {
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
  };

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
      const url = '/api/categories';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const cats = data.product_cats || [];
      
      // Fetch số lượng sản phẩm cho mỗi danh mục
      const categoriesWithProductCount = await Promise.all(
        cats.map(async (cat: { title: string; slug: string }) => {
          try {
            const prodResponse = await fetch(`/api/categories/${cat.slug}`);
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
            console.error(`Error counting products for ${cat.slug}:`, error);
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
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, [selectedCategory]);

  // Fetch featured products
  const fetchFeaturedProducts = async () => {
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
  };

  // Fetch new products
  const fetchNewProducts = async () => {
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
  };

  // Fetch combo products
  const fetchComboProducts = async () => {
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
  };

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
        const [brandsResult, productsResult] = await Promise.all([
          fetchBrands(),
          fetchProducts()
        ]);
        
        // Then load categories and initialize first category
        await fetchCategories();
        
        // Load other data in the background
        Promise.all([
          fetchFeaturedProducts(),
          fetchNewProducts(),
          fetchComboProducts()
        ]);
        
        initialLoadComplete.current = true;
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };
    
    loadInitialData();
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

  if (isMobile) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <MobileHomeHeader />
        <MobileHomeTabs 
          categories={categories}
          loading={loadingCategories}
          onCategoryChange={handleCategoryChange} 
        />
        {/* Section: Sản phẩm bán chạy */}
        <MobileBestsellerProducts {...mobileBestsellerProps} />
        <MobileCatogeryFeature {...mobileCategoryFeatureProps} />
        {/* Được đề xuất cho bạn */}
        <MobileFeatureProduct {...mobileFeatureProductProps} />
      </div>
    );
  }

  // Desktop giữ nguyên
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <HeroCarousel />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Featured Products */}
      <FeaturedProducts 
        products={featuredProducts} 
        loading={loadingFeatured} 
        error={featuredError} 
      />

      {/* Combo Product */}
      <ComboProduct 
        products={comboProducts} 
        loading={loadingCombo} 
        error={comboError} 
      />

      {/* New Products */}
      <NewProducts 
        products={newProducts} 
        loading={loadingNew} 
        error={newError} 
      />

      {/* Brands */}
      <BrandLogos 
        brands={brands} 
        loading={loadingBrands} 
        error={brandError} 
      />

      {/* Blog Posts */}
      <BlogPosts />
    </div>
  );
}
