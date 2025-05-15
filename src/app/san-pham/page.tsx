'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/features/product/ProductCard';
import { Product } from '@/types';
import { SidebarFilter } from '@/components/store/sidebarfilter';
import { Breadcrumb } from '@/components/common/Breadcrumb';
// Đã comment import vì hiện tại chưa sử dụng
// import { createBrowserClient } from '@/lib/supabase';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridView, setGridView] = useState<'4' | '5' | '6'>('5');
  const [maxPrice, setMaxPrice] = useState(10000000);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Đây là client component nên có thể sử dụng hoặc browser client hoặc API route
      // Phương án 1: Sử dụng API route (bảo trì đơn giản hơn)
      const url = '/api/products';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      let productsData = data.products || [];
      // Sắp xếp sản phẩm theo giá tăng dần
      productsData = productsData.sort((a: Product, b: Product) => a.price - b.price);
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      // Tính giá trị sản phẩm đắt nhất và làm tròn lên hàng triệu
      let max = productsData.length > 0 ? Math.max(...productsData.map((p: Product) => p.price)) : 10000000;
      max = Math.ceil(max / 1000000) * 1000000;
      setMaxPrice(max);
      
      console.log(`Nhận được ${productsData.length} sản phẩm từ API`);

      
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: {
    priceRange: { min: number; max: number };
    brandIds: number[];
    categoryIds: number[];
  }) => {
    const { priceRange, brandIds, categoryIds } = filters;
    
    const filtered = products.filter((product) => {
      const priceInRange = product.price >= priceRange.min && product.price <= priceRange.max;
      const brandMatch = brandIds.length === 0 || (product.brand_id && brandIds.includes(Number(product.brand_id)));
      const categoryMatch = categoryIds.length === 0 || (product.category_id && categoryIds.includes(Number(product.category_id)));
      return priceInRange && brandMatch && categoryMatch;
    });
    
    // Sắp xếp sản phẩm đã lọc theo giá tăng dần
    setFilteredProducts(filtered.sort((a, b) => a.price - b.price));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto  py-8 ">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-6">
        {/* Sidebar Filter */}
        <div className="md:col-span-1">
          <SidebarFilter onFilterChange={handleFilterChange} maxPrice={maxPrice} />
        </div>

        {/* Products Grid */}
        <div className="md:col-span-5">
          {error && (
            <div className="mb-8 rounded-md bg-red-50 p-4 text-red-600">
              Đã xảy ra lỗi: {error}
            </div>
          )}

          <div className="bg-white rounded-lg  mb-6">
            <div className="flex items-center justify-between">
              <Breadcrumb
                items={[
                  { label: 'Trang chủ', href: '/' },
                  { label: 'Sản phẩm' }
                ]}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setGridView('4')}
                  className={`p-2 rounded-md ${
                    gridView === '4' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                  aria-label="4 sản phẩm mỗi hàng"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setGridView('5')}
                  className={`p-2 rounded-md ${
                    gridView === '5' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                  aria-label="5 sản phẩm mỗi hàng"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM17 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" />
                  </svg>
                </button>
                <button
                  onClick={() => setGridView('6')}
                  className={`p-2 rounded-md ${
                    gridView === '6' ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                  aria-label="6 sản phẩm mỗi hàng"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM17 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM17 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${gridView === '4' ? 'md:grid-cols-4' : gridView === '5' ? 'md:grid-cols-5' : 'md:grid-cols-6'} lg:grid-cols-${gridView}`}>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square w-full rounded-lg bg-gray-200" />
                  <div className="mt-2 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${gridView === '4' ? 'md:grid-cols-4' : gridView === '5' ? 'md:grid-cols-5' : 'md:grid-cols-6'} lg:grid-cols-${gridView}`}>
              {filteredProducts.map((product) => (
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
