import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Product, Brand } from '@/types';
import { ProductCard } from '@/components/pc/product/ProductCard';

const VISIBLE_ITEMS = 6;

export default function NewProducts({ 
  products = [],
  loading = false,
  error = null,
  brands = []
}: {
  products: Product[];
  loading: boolean;
  error: string | null;
  brands?: Brand[];
}) {
  const [startIndex, setStartIndex] = useState(0);

  const nextItem = () => {
    setStartIndex((prev) => (prev + 1) % products.length);
  };

  const prevItem = () => {
    setStartIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const getVisibleProducts = () => {
    const visibleProducts = [];
    for (let i = 0; i < VISIBLE_ITEMS; i++) {
      const index = (startIndex + i) % products.length;
      visibleProducts.push(products[index]);
    }
    return visibleProducts;
  };

  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 uppercase">
            Mới Cập Nhật
          </h2>
          {!loading && products.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{startIndex + 1}</span>
              <span>/</span>
              <span>{products.length}</span>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
            Đã xảy ra lỗi: {error}
          </div>
        )}

        <div className="relative">
          {/* Navigation buttons */}
          <button
            onClick={prevItem}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 -translate-x-1/2"
            aria-label="Previous item"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextItem}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 translate-x-1/2"
            aria-label="Next item"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(VISIBLE_ITEMS)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square w-full rounded-lg bg-gray-200" />
                  <div className="mt-2 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {getVisibleProducts().map((product, index) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
              <p className="text-base text-gray-600">Không tìm thấy sản phẩm nào.</p>
              <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 