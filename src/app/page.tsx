'use client';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import NewProducts from '@/components/NewProducts';
import BlogPosts from '@/components/BlogPosts';
import BrandLogos from '@/components/BrandLogos';
import FeaturedProducts from '@/components/FeaturedProducts';
import ComboProduct from '@/components/ComboProduct';
import { useEffect, useState, useCallback } from 'react';
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
    
    try {
      setLoading(true);
      const url = `/api/categories/${categorySlug}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setCategoryProducts(data.products || []);
    } catch (error: unknown) {
      console.error(`Error fetching products for category ${categorySlug}:`, error);
      setCategoryProducts([]);
    } finally {
      setLoading(false);
    }
  }, [products]);

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
      
      // Thiết lập danh mục mặc định là danh mục đầu tiên
      if (filteredCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(filteredCategories[0].slug);
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

  // Xử lý khi danh mục thay đổi
  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      setCategoryProducts(products);
    }
  }, [selectedCategory, products, fetchProductsByCategory]);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
    fetchFeaturedProducts();
    fetchNewProducts();
    fetchComboProducts();
  }, [fetchCategories]);

  // Lọc brands theo danh mục
  const filteredBrands = selectedCategory
    ? brands.filter(brand => {
        // Kiểm tra xem brand có sản phẩm thuộc category hiện tại không
        return categoryProducts.some(product => product.brand_id === brand.id);
      })
    : brands;

  if (isMobile) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <MobileHomeHeader />
        <MobileHomeTabs 
          categories={categories}
          loading={loadingCategories}
          onCategoryChange={setSelectedCategory} 
        />
        {/* Section: Sản phẩm bán chạy */}
        <MobileBestsellerProducts 
          products={categoryProducts} 
          loading={loading} 
          error={error} 
        />
        <MobileCatogeryFeature 
          brands={filteredBrands} 
          loading={loadingBrands} 
          error={brandError} 
          categorySlug={selectedCategory}
        />
        {/* Được đề xuất cho bạn */}
        <MobileFeatureProduct 
          products={categoryProducts} 
          brands={brands} 
          loading={loading} 
          error={error} 
        />
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
