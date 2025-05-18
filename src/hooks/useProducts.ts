'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { useDomain } from '@/context/domain-context';

interface UseProductsOptions {
  categoryId?: string;
  brandId?: string;
  sort?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { sectorId, isLocalhost } = useDomain();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build URL with query parameters
      const url = new URL('/api/products', window.location.origin);
      
      // Add sector ID if available and not on localhost
      if (sectorId && !isLocalhost) {
        url.searchParams.append('sector_id', sectorId);
      }
      
      // Add other filter parameters
      if (options.categoryId) {
        url.searchParams.append('category_id', options.categoryId);
      }
      
      if (options.brandId) {
        url.searchParams.append('brand_id', options.brandId);
      }
      
      if (options.sort) {
        url.searchParams.append('sort', options.sort);
      }
      
      // On localhost, explicitly disable domain-based filtering
      if (isLocalhost) {
        url.searchParams.append('use_domain', 'false');
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  }, [sectorId, isLocalhost, options.categoryId, options.brandId, options.sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refresh: fetchProducts
  };
} 