import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { StarIcon } from '@radix-ui/react-icons';

interface MobileFeatureProductProps {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const MobileFeatureProduct: React.FC<MobileFeatureProductProps> = ({ products, loading, error }) => {
  // Group products by brand
  const productsByBrand = products.reduce((acc, product) => {
    const brand = product.brand || 'Khác';
    if (!acc[brand]) {
      acc[brand] = [];
    }
    acc[brand].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <section className="pt-4">
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
          Đã xảy ra lỗi: {error}
        </div>
      )}
      {loading ? (
        <div className="flex gap-4 overflow-x-auto flex-nowrap snap-x snap-mandatory">
          {[0, 1].map((colIdx) => (
            <div key={colIdx} className="w-4/5 min-w-[220px] mx-auto space-y-3 snap-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full bg-white rounded-lg shadow p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-1/2 rounded bg-gray-200" />
                      <div className="h-3 w-1/4 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(productsByBrand).map(([brand, brandProducts]) => (
            <div key={brand} className="space-y-3">
              <h2 className="text-lg font-semibold text-red-700 ml-4">Thương hiệu {brand}</h2>
              <div className="flex gap-4 overflow-x-auto flex-nowrap snap-x snap-mandatory px-4 pb-4 scrollbar-hide">
                {[0, 1].map((colIdx) => (
                  <div key={colIdx} className="w-[95%] min-w-[320px] mx-auto space-y-3 snap-center">
                    {brandProducts.slice(colIdx * 3, colIdx * 3 + 3).map((product) => (
                      <div key={product.id} className="w-full bg-white rounded-lg shadow flex items-center">
                        <div className="relative w-24 h-24">
                          <Image
                            src={product.image_url || "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200&auto=format"}
                            alt={product.name}
                            fill
                            className="rounded-l-lg object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 p-3">
                          <div className="font-medium text-sm truncate overflow-hidden text-ellipsis whitespace-nowrap">{product.name}</div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-500 font-semibold">{formatCurrency(product.price)}</span>
                              {product.original_price && product.original_price > product.price && (
                                <>
                                  <span className="text-xs text-gray-400 line-through">{formatCurrency(product.original_price)}</span>
                                  {product.discount_percentage && (
                                    <span className="text-xs text-red-500">-{product.discount_percentage}%</span>
                                  )}
                                </>
                              )}
                            </div>
                            {product.rating && (
                              <div className="flex items-center gap-1">
                                <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-base text-gray-600">Không tìm thấy sản phẩm nào.</p>
          <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau.</p>
        </div>
      )}
    </section>
  );
};

export default MobileFeatureProduct; 