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
import Image from 'next/image';
import { Product } from '@/types';
import MobileFeatureProduct from '@/components/mobile/MobileFeatureProduct';

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
        <MobileHomeHeader onVisibilityChange={setIsHeaderVisible} />
        <MobileHomeTabs isHeaderVisible={isHeaderVisible} />
        
        {/* Section: Trò chơi đăng ký trước */}
        <section className="px-4 pt-4">
          <h2 className="text-lg font-semibold mb-2 text-red-700">Trò chơi đăng ký trước</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="min-w-[220px] bg-white rounded-lg shadow p-2">
              <div className="relative w-full h-28 mb-2">
                <Image 
                  src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format" 
                  alt="game1" 
                  fill
                  className="rounded-md object-cover" 
                />
              </div>
              <div className="font-medium text-sm">Broken Sword: Reforged</div>
              <div className="text-xs text-gray-500">Phiêu lưu • Sắp có</div>
            </div>
            <div className="min-w-[220px] bg-white rounded-lg shadow p-2">
              <div className="relative w-full h-28 mb-2">
                <Image 
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format" 
                  alt="game2" 
                  fill
                  className="rounded-md object-cover" 
                />
              </div>
              <div className="font-medium text-sm">Elysia: The Astral Realm</div>
              <div className="text-xs text-gray-500">Nhập vai • Sắp có</div>
            </div>
          </div>
        </section>

        {/* Được đề xuất cho bạn */}
        <MobileFeatureProduct products={products} loading={loading} error={error} />

        {/* Section: Trò chơi có tính phí */}
        <section className="px-4 pt-4 pb-24">
          <h2 className="text-lg font-semibold mb-2 text-red-700">Trò chơi có tính phí</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <div className="min-w-[220px] bg-white rounded-lg shadow p-2">
              <div className="relative w-full h-28 mb-2">
                <Image 
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format" 
                  alt="game3" 
                  fill
                  className="rounded-md object-cover" 
                />
              </div>
              <div className="font-medium text-sm">Game Premium 1</div>
              <div className="text-xs text-gray-500">Chiến thuật • 4X</div>
            </div>
            <div className="min-w-[220px] bg-white rounded-lg shadow p-2">
              <div className="relative w-full h-28 mb-2">
                <Image 
                  src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format" 
                  alt="game4" 
                  fill
                  className="rounded-md object-cover" 
                />
              </div>
              <div className="font-medium text-sm">Game Premium 2</div>
              <div className="text-xs text-gray-500">Nhập vai</div>
            </div>
          </div>
        </section>
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
