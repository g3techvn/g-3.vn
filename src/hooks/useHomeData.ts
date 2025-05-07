import { useQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@/lib/api';

// Thời gian cache (1 giờ)
const STALE_TIME = 60 * 60 * 1000;

// Hook lấy danh mục
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await apiClient.get(API_ENDPOINTS.CATEGORIES);
      return data.categories;
    },
    staleTime: STALE_TIME,
  });
}

// Hook lấy sản phẩm mới (sử dụng API products)
export function useNewProducts() {
  return useQuery({
    queryKey: ['newProducts'],
    queryFn: async () => {
      const data = await apiClient.get(API_ENDPOINTS.PRODUCTS + '?sort=newest&limit=12');
      return data.products;
    },
    staleTime: STALE_TIME,
  });
}

// Hook lấy sản phẩm nổi bật
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const data = await apiClient.get(API_ENDPOINTS.FEATURED_PRODUCTS);
      return data.featuredProducts;
    },
    staleTime: STALE_TIME,
  });
}

// Hook lấy bài viết blog
export function useBlogPosts() {
  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const data = await apiClient.get(API_ENDPOINTS.BLOG_POSTS);
      return data.blogPosts;
    },
    staleTime: STALE_TIME,
  });
}

// Hook lấy dữ liệu carousel
export function useCarouselItems() {
  return useQuery({
    queryKey: ['carouselItems'],
    queryFn: async () => {
      const data = await apiClient.get(API_ENDPOINTS.CAROUSEL);
      return data.carouselItems;
    },
    staleTime: STALE_TIME,
  });
}

// Hook lấy dữ liệu các tab sản phẩm
export function useProductTabs() {
  return useQuery({
    queryKey: ['productTabs'],
    queryFn: async () => {
      const data = await apiClient.get(API_ENDPOINTS.PRODUCT_TABS);
      return data.livestreamTabs;
    },
    staleTime: STALE_TIME,
  });
}

// Hook lấy dữ liệu combo sản phẩm
export function useComboProducts() {
  return useQuery({
    queryKey: ['comboProducts'],
    queryFn: async () => {
      const data = await apiClient.get(API_ENDPOINTS.COMBO_PRODUCTS);
      return data.comboItems;
    },
    staleTime: STALE_TIME,
  });
}

// Hook tổng hợp - lấy tất cả dữ liệu cho trang chủ
export function useHomePageData() {
  const categoriesQuery = useCategories();
  const newProductsQuery = useNewProducts();
  const featuredProductsQuery = useFeaturedProducts();
  const blogPostsQuery = useBlogPosts();
  const carouselQuery = useCarouselItems();
  const productTabsQuery = useProductTabs();
  const comboProductsQuery = useComboProducts();

  // Kiểm tra trạng thái loading của tất cả các query
  const isLoading = 
    categoriesQuery.isLoading || 
    newProductsQuery.isLoading || 
    featuredProductsQuery.isLoading || 
    blogPostsQuery.isLoading || 
    carouselQuery.isLoading || 
    productTabsQuery.isLoading || 
    comboProductsQuery.isLoading;

  // Kiểm tra trạng thái lỗi
  const isError = 
    categoriesQuery.isError || 
    newProductsQuery.isError || 
    featuredProductsQuery.isError || 
    blogPostsQuery.isError || 
    carouselQuery.isError || 
    productTabsQuery.isError || 
    comboProductsQuery.isError;

  // Gộp các lỗi
  const error = 
    categoriesQuery.error || 
    newProductsQuery.error || 
    featuredProductsQuery.error || 
    blogPostsQuery.error || 
    carouselQuery.error || 
    productTabsQuery.error || 
    comboProductsQuery.error;

  return {
    categories: categoriesQuery.data || [],
    newProducts: newProductsQuery.data || [],
    featuredProducts: featuredProductsQuery.data || [],
    blogPosts: blogPostsQuery.data || [],
    carouselItems: carouselQuery.data || [],
    livestreamTabs: productTabsQuery.data || [],
    comboItems: comboProductsQuery.data || [],
    isLoading,
    isError,
    error,
  };
} 