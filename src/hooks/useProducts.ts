'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';

interface UseProductsOptions {
  categoryId?: string;
  brandId?: string;
  sort?: string;
  type?: string;
  limit?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build relative URL with query parameters
      let url = '/api/products';
      const params = new URLSearchParams();
      if (options.categoryId) params.append('category_id', options.categoryId);
      if (options.brandId) params.append('brand_id', options.brandId);
      if (options.sort) params.append('sort', options.sort);
      if (options.type) params.append('type', options.type);
      if (options.limit) params.append('limit', options.limit.toString());
      if ([...params].length > 0) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // If rate limited and we haven't exceeded max retries, try again
        if (response.status === 429 && retryCount < MAX_RETRIES) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return fetchProducts(retryCount + 1);
        }

        // If server error and we haven't exceeded max retries, try again after delay
        if (response.status === 500 && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return fetchProducts(retryCount + 1);
        }

        const errorData = await response.json().catch(() => ({}));
        if (errorData.error) {
          throw new Error(errorData.error);
        } else {
          throw new Error(`Lỗi khi tải sản phẩm (${response.status})`);
        }
      }
      
      const data = await response.json();
      if (!data.products) {
        throw new Error('Không tìm thấy dữ liệu sản phẩm');
      }
      
      setProducts(data.products);
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [options.categoryId, options.brandId, options.sort, options.type, options.limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refresh: () => fetchProducts()
  };
} 