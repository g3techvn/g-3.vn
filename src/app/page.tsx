'use client';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import NewProducts from '@/components/NewProducts';
import BlogPosts from '@/components/BlogPosts';
import BrandLogos from '@/components/BrandLogos';
import FeaturedProducts from '@/components/FeaturedProducts';
import ComboProduct from '@/components/ComboProduct';
import { useEffect, useState } from 'react';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import MobileHomeTabs from '@/components/mobile/MobileHomeTabs';
import { Product } from '@/types';
import MobileFeatureProduct from '@/components/mobile/MobileFeatureProduct';
import MobileBestsellerProducts from '@/components/mobile/MobileBestsellerProducts';
import MobileCatogeryFeature from '@/components/mobile/MobileCatogeryFeature';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

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

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  if (isMobile) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <MobileHomeHeader />
        <MobileHomeTabs />
        {/* Section: Sản phẩm bán chạy */}
        <MobileBestsellerProducts />
        <MobileCatogeryFeature />
        {/* Được đề xuất cho bạn */}
        <MobileFeatureProduct products={products} loading={loading} error={error} />
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
      <FeaturedProducts  />

      {/* Combo Product */}
      <ComboProduct         />

      {/* New Products */}
      <NewProducts />

      {/* Brands */}
      <BrandLogos />

      {/* Blog Posts */}
      <BlogPosts />
    </div>
  );
}
