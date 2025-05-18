import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Card, CardBadge, CardContent, CardHeader } from '@/components/ui/Card';
import { Rating } from '@/components/ui/Rating';
import { Product, Brand } from '@/types';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

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
  const { addToCart } = useCart();
  const [brandNames, setBrandNames] = useState<Record<string, string>>({});

  // Build a map of brand_id to brand name
  useEffect(() => {
    if (brands.length > 0) {
      const brandMap: Record<string, string> = {};
      brands.forEach(brand => {
        brandMap[brand.id] = brand.title;
      });
      setBrandNames(brandMap);
    }
  }, [brands]);

  // Get brand name from the map or use defaults
  const getBrandName = (product: Product) => {
    if (product.brand) return product.brand;
    if (product.brand_id && brandNames[product.brand_id]) return brandNames[product.brand_id];
    return 'Không rõ';
  };

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
              {getVisibleProducts().map((product) => (
                <div key={product.id} className="relative">
                  <Link href={`/san-pham/${product.slug || product.id}`}>
                    <Card className="h-full relative">
                      <CardHeader>
                        {product.discount_percentage && product.discount_percentage > 0 && (
                          <CardBadge>-{product.discount_percentage}%</CardBadge>
                        )}
                        <AspectRatio ratio={1 / 1}>
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                width={300}
                                height={300}
                                className="w-full h-auto object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </div>
                        </AspectRatio>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="text-xs text-gray-500 mb-1">{getBrandName(product)}</div>
                        
                        <h3 className="text-xs font-medium mb-2 text-gray-800 group-hover:text-red-600 line-clamp-2 h-[2.5rem]">
                          {product.name}
                        </h3>
                        
                        <Rating value={product.rating || 4} className="mb-2" />
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div>
                            {product.original_price ? (
                              <>
                                <span className="text-gray-500 line-through text-xs">
                                  {product.original_price.toLocaleString()}₫
                                </span>
                                <span className="text-red-600 font-bold text-sm block">
                                  {product.price.toLocaleString()}₫
                                </span>
                              </>
                            ) : (
                              <span className="text-red-600 font-bold text-sm">
                                {product.price.toLocaleString()}₫
                              </span>
                            )}
                          </div>
                          <button 
                            className="p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors duration-200"
                            aria-label="Thêm vào giỏ hàng"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(product);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
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