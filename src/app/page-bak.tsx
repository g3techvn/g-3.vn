'use client';
import HeroCarousel from '@/components/HeroCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import NewProducts from '@/components/NewProducts';
import BlogPosts from '@/components/BlogPosts';
import BrandLogos from '@/components/BrandLogos';
import FeaturedProducts from '@/components/FeaturedProducts';
import ProductTabsRadix from '@/components/ProductTabsRadix';
import ComboProduct from '@/components/ComboProduct';
import { useHomePageData } from '@/hooks/useHomeData';

// Import skeleton components
import { 
  ProductTabsRadix2Skeleton, 
  CategoryGridSkeleton,
  FeaturedProductsSkeleton,
  BlogPostsSkeleton,
  BrandLogosSkeleton,
  HeroCarouselSkeleton,
  ComboProductSkeleton
} from '@/components/skeletons';

export default function Home() {
  // Sử dụng React Query hook để lấy tất cả dữ liệu trang chủ
  const { 
    categories,
    newProducts, 
    blogPosts,
    carouselItems,
    featuredProducts,
    livestreamTabs,
    comboItems,
    isLoading,
    isError
  } = useHomePageData();

  // Xử lý trạng thái lỗi
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Đã xảy ra lỗi</h2>
          <p className="mb-4">Không thể tải dữ liệu trang chủ</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị skeleton trong khi đang tải dữ liệu
  if (isLoading) {
    return (
      <main className="min-h-screen">
        {/* Hero Carousel Skeleton */}
        {/* <HeroCarouselSkeleton /> */}

        {/* Categories Skeleton */}
        {/* <CategoryGridSkeleton /> */}

        {/* Featured Products Skeleton */}
        {/* <FeaturedProductsSkeleton /> */}
        
        {/* Combo Product Skeleton */}
        {/* <ComboProductSkeleton /> */}
        
        {/* Product Tabs Skeleton */}
        {/* <ProductTabsRadix2Skeleton /> */}

        {/* Brand Logos Skeleton */}
        {/* <BrandLogosSkeleton /> */}

        {/* New Products Skeleton - reuse featured products skeleton */}
        {/* <FeaturedProductsSkeleton /> */}

        {/* Blog Posts Skeleton */}
        {/* <BlogPostsSkeleton /> */}
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      {/* <HeroCarousel items={carouselItems} /> */}


      {/* Category Grid */}


      {/* <CategoryGrid categories={categories} /> */}


      {/* Featured Products */}
    

      {/* <FeaturedProducts title="Phụ kiện Action Cam nổi bật" products={featuredProducts} /> */}

      
      {/* Combo Product */}
      
      
      {/* <ComboProduct 
          title="BỘ SẢN PHẨM PHỤ KIỆN INSTA360" 
          backgroundColor="bg-gray-100"
          bannerImage="/images/banners/insta360-banner.svg"
          comboItems={comboItems} 
        /> */}

      {/* Phụ kiện Livestream Tabs */}
   
      {/* <ProductTabsRadix title="PHỤ KIỆN LIVESTREAM" tabs={livestreamTabs} /> */}


      {/* New Products */}

      {/* <NewProducts products={newProducts} /> */}


      {/* Brands */}
    
        {/* <BrandLogos /> */}
     

      {/* Blog Posts */}
      
        {/* <BlogPosts posts={blogPosts} /> */}
   

      {/* Extra content for scrolling */}
     
    </div>
  );
}
