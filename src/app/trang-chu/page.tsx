'use client';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import NewProducts from '@/components/NewProducts';
import BlogPosts from '@/components/BlogPosts';
import BrandLogos from '@/components/BrandLogos';
import FeaturedProducts from '@/components/FeaturedProducts';
import ComboProduct from '@/components/ComboProduct';

export default function Home() {
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

      {/* Phụ kiện Livestream Tabs */}

      {/* New Products */}
      <NewProducts />

      {/* Brands */}
      <BrandLogos />

      {/* Blog Posts */}
      <BlogPosts />
    </div>
  );
}
