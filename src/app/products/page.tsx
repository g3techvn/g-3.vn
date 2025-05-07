'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/features/product/ProductCard';
import { Product } from '@/types';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import ProductFilter from './components/ProductFilter';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sort: 'newest' as string,
    source: 'gami' as string,
    brand: undefined as string | undefined
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Tạo URL với các tham số lọc và sắp xếp
      let url = '/api/products';
      const params = new URLSearchParams();
      
      if (filters.minPrice !== undefined) {
        params.append('minPrice', filters.minPrice.toString());
      }
      
      if (filters.maxPrice !== undefined) {
        params.append('maxPrice', filters.maxPrice.toString());
      }
      
      if (filters.sort) {
        params.append('sort', filters.sort);
      }
      
      if (filters.source) {
        params.append('source', filters.source);
      }
      
      if (filters.brand) {
        params.append('brand', filters.brand);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // Gọi API
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      console.log(`Nhận được ${data.products?.length || 0} sản phẩm từ API`);
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters: {
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    source?: string;
    brand?: string;
  }) => {
    setFilters(prev => ({ 
      ...prev, 
      ...newFilters 
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Tất cả sản phẩm</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-6">
        <div className="md:col-span-1">
          <ProductFilter onFilter={handleFilter} currentFilter={filters} />
        </div>

        <div className="md:col-span-5">
          {error && (
            <div className="mb-8 rounded-md bg-red-50 p-4 text-red-600">
              Đã xảy ra lỗi: {error}
            </div>
          )}

          <div className="mb-4 rounded-md bg-blue-50 p-2 text-blue-700">
            Tổng số sản phẩm: {products.length}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-lg text-gray-600">Không tìm thấy sản phẩm nào.</p>
              <p className="mt-2 text-sm text-gray-500">Vui lòng thử lại với bộ lọc khác.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
