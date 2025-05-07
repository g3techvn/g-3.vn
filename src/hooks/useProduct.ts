import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Thời gian cache (30 phút)
const STALE_TIME = 30 * 60 * 1000;

// Hook lấy chi tiết sản phẩm
export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const data = await apiClient.get(`/api/products/${productId}`);
      return data.product;
    },
    staleTime: STALE_TIME,
    // Không fetch khi không có productId
    enabled: !!productId,
  });
}

// Hook lấy danh sách sản phẩm theo danh mục
export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      const data = await apiClient.get(`/api/categories/${categoryId}/products`);
      return data.products;
    },
    staleTime: STALE_TIME,
    // Không fetch khi không có categoryId
    enabled: !!categoryId,
  });
}

// Hook tìm kiếm sản phẩm
export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      const data = await apiClient.get(`/api/products/search?q=${encodeURIComponent(query)}`);
      return data.products;
    },
    // Chỉ cache trong thời gian ngắn cho kết quả tìm kiếm
    staleTime: 5 * 60 * 1000, // 5 phút
    // Chỉ tìm kiếm khi có query và độ dài > 2 ký tự
    enabled: !!query && query.length > 2,
  });
}

// Hook lấy sản phẩm liên quan
export function useRelatedProducts(productId: string) {
  return useQuery({
    queryKey: ['products', 'related', productId],
    queryFn: async () => {
      const data = await apiClient.get(`/api/products/${productId}/related`);
      return data.relatedProducts;
    },
    staleTime: STALE_TIME,
    enabled: !!productId,
  });
}

// Hook thêm đánh giá sản phẩm
export function useAddProductReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData: {
      productId: string;
      rating: number;
      comment: string;
      userName: string;
    }) => {
      const { productId, ...restData } = reviewData;
      const response = await apiClient.post(`/api/products/${productId}/reviews`, restData);
      return response;
    },
    onSuccess: (data, variables) => {
      // Cập nhật cache cho sản phẩm sau khi thêm đánh giá thành công
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
    },
  });
}

// Hook lọc sản phẩm theo nhiều tiêu chí
export function useFilteredProducts(filters: Record<string, unknown>) {
  const queryString = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

  return useQuery({
    queryKey: ['products', 'filter', filters],
    queryFn: async () => {
      const data = await apiClient.get(`/api/products/filter?${queryString}`);
      return data.products;
    },
    staleTime: STALE_TIME,
    // Chỉ fetch khi có ít nhất 1 filter
    enabled: queryString.length > 0,
  });
} 