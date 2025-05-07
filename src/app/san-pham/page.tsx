'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/features/product/ProductCard';
import { Product } from '@/types';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
// Đã comment import vì hiện tại chưa sử dụng
// import { createBrowserClient } from '@/lib/supabase';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setProducts(data.products || []);
      console.log(`Nhận được ${data.products?.length || 0} sản phẩm từ API`);

      // Phương án 2: Sử dụng trực tiếp browser client
      // Uncomment nếu muốn sử dụng
      // const supabase = createBrowserClient();
      // const { data, error } = await supabase
      //   .from('products')
      //   .select('*')
      //   .order('created_at', { ascending: false });
      // 
      // if (error) {
      //   throw new Error(error.message);
      // }
      // 
      // setProducts(data || []);
      // console.log(`Nhận được ${data?.length || 0} sản phẩm từ Supabase Browser Client`);
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Tất cả sản phẩm</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-6">
      
        <div className="md:col-span-6">
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
