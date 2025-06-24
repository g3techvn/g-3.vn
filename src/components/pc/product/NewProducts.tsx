import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Product, Brand } from '@/types';
import { ProductCard } from '@/components/pc/product/ProductCard';

const VISIBLE_ITEMS = 6;

export default function NewProducts({ 
  products = [],
  brands = []
}: {
  products: Product[];
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

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 uppercase">
            Mới lên kệ
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{startIndex + 1}</span>
            <span>/</span>
            <span>{products.length}</span>
          </div>
        </div>

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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {getVisibleProducts().map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 