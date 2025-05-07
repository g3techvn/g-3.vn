import React, { useState, useEffect } from 'react';
import { 
  ProductTabsRadixSkeleton,
  FeaturedProductsSkeleton,
  BlogPostsSkeleton,
  BrandLogosSkeleton,
  CategoryGridSkeleton
} from './skeletons';

// Components thực
import ProductTabsRadix from './ProductTabsRadix';
import FeaturedProducts from './FeaturedProducts';
import BlogPosts from './BlogPosts';
import BrandLogos from './BrandLogos';
import CategoryGrid from './CategoryGrid';

// Định nghĩa các interface props cho từng component
interface ProductTabsProps {
  title: string;
  tabs: Array<{
    id: string;
    name: string;
    products: Array<{
      id: number;
      sku: string;
      name: string;
      price: number;
      originalPrice?: number;
      discount?: number;
      image: string;
      brand: string;
      rating?: number;
      url: string;
    }>;
  }>;
}

interface FeaturedProductsProps {
  title: string;
  products: Array<{
    id: number;
    name: string;
    category: string;
    image: string;
    url: string;
  }>;
  autoSlideInterval?: number;
}

interface BlogPostsProps {
  posts: Array<{
    id: number;
    title: string;
    date: string;
    image: string;
    excerpt?: string;
  }>;
}

interface CategoryGridProps {
  categories: Array<{
    name: string;
    image: string;
  }>;
}

// Định nghĩa union type cho tất cả các loại dữ liệu
type ComponentDataType = 
  | ProductTabsProps 
  | FeaturedProductsProps 
  | BlogPostsProps 
  | CategoryGridProps 
  | Record<string, never>; // Cho BrandLogos không cần props

// Type dữ liệu cho demo
type DemoProps = {
  componentType: 
    | 'product-tabs' 
    | 'featured-products' 
    | 'blog-posts' 
    | 'brand-logos' 
    | 'category-grid';
  data?: ComponentDataType;
  fetchData?: () => Promise<ComponentDataType>;
  loadingTime?: number; // Thời gian loading mô phỏng (ms)
}

export default function SkeletonDemo({ 
  componentType, 
  data: initialData,
  fetchData,
  loadingTime = 2000 // Mặc định 2 giây
}: DemoProps) {
  const [data, setData] = useState<ComponentDataType | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);

  useEffect(() => {
    if (!initialData && fetchData) {
      const loadData = async () => {
        try {
          setLoading(true);
          // Thêm độ trễ giả lập cho demo
          await new Promise(resolve => setTimeout(resolve, loadingTime));
          const result = await fetchData();
          setData(result);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [initialData, fetchData, loadingTime]);

  // Render skeleton trong khi loading
  if (loading) {
    switch (componentType) {
      case 'product-tabs':
        return <ProductTabsRadixSkeleton />;
      case 'featured-products':
        return <FeaturedProductsSkeleton />;
      case 'blog-posts':
        return <BlogPostsSkeleton />;
      case 'brand-logos':
        return <BrandLogosSkeleton />;
      case 'category-grid':
        return <CategoryGridSkeleton />;
      default:
        return null;
    }
  }

  // Render component thực khi đã tải xong dữ liệu
  if (data) {
    switch (componentType) {
      case 'product-tabs':
        return <ProductTabsRadix {...data as ProductTabsProps} />;
      case 'featured-products':
        return <FeaturedProducts {...data as FeaturedProductsProps} />;
      case 'blog-posts':
        return <BlogPosts {...data as BlogPostsProps} />;
      case 'brand-logos':
        return <BrandLogos />;
      case 'category-grid':
        return <CategoryGrid {...data as CategoryGridProps} />;
      default:
        return null;
    }
  }

  return null;
} 