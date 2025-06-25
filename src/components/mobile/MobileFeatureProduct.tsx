import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Product, Brand } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { StarIcon } from '@radix-ui/react-icons';
import { useCart } from '@/context/CartContext';
import OptimizedImage from '@/components/common/OptimizedImage';
import Image from 'next/image';
import { CartItem } from '@/types/cart';

interface MobileFeatureProductProps {
  products: Product[];
  brands: Brand[];
}

const MobileFeatureProduct: React.FC<MobileFeatureProductProps> = React.memo(({ 
  products, 
  brands
}) => {
  const productIds = products.map(p => p.id.toString());
  const { addToCart } = useCart();
  const [currentSlides, setCurrentSlides] = useState<Record<string, number>>({});
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Biến đổi mảng brands thành map để dễ truy cập - memoized
  const brandsMap = useMemo(() => {
    return brands.reduce((acc, brand) => {
      acc[brand.id] = brand;
      return acc;
    }, {} as Record<string, Brand>);
  }, [brands]);

  // Initialize currentSlides when products change
  useEffect(() => {
    if (!products || products.length === 0) {
      setCurrentSlides({});
      return;
    }
    
    const initialSlides: Record<string, number> = {};
    products.forEach(product => {
      const brandId = product.brand_id || 'unknown';
      if (!initialSlides[brandId]) {
        initialSlides[brandId] = 0;
      }
    });
    setCurrentSlides(initialSlides);
  }, [products]);

  // Group products by brand_id - memoized
  const productsByBrand = useMemo(() => {
    if (!products || products.length === 0) return {};
    
    const grouped = products.reduce((acc, product) => {
      const brandId = product.brand_id || 'unknown';
      if (!acc[brandId]) {
        acc[brandId] = [];
      }
      acc[brandId].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
    
    // Sort products by price within each brand
    Object.keys(grouped).forEach(brandId => {
      grouped[brandId].sort((a, b) => a.price - b.price);
    });
    
    return grouped;
  }, [products]);

  // Sort brand entries once and memoize
  const sortedBrandEntries = useMemo(() => {
    return Object.entries(productsByBrand)
      .sort(([brandIdA], [brandIdB]) => {
        const brandA = brandsMap[brandIdA]?.title || '';
        const brandB = brandsMap[brandIdB]?.title || '';
        const brandALower = brandA.toLowerCase();
        const brandBLower = brandB.toLowerCase();
        
        // Sort alphabetically without prioritizing any brand
        return brandALower.localeCompare(brandBLower);
      });
  }, [productsByBrand, brandsMap]);

  const handleScroll = useCallback((brandId: string) => {
    if (scrollRefs.current[brandId]) {
      const container = scrollRefs.current[brandId];
      const containerWidth = container.offsetWidth;
      const scrollPosition = container.scrollLeft;
      const maxScroll = container.scrollWidth - containerWidth;
      
      // Calculate the number of columns
      const totalColumns = Math.ceil(productsByBrand[brandId].length / 3);
      
      if (maxScroll <= 0) {
        setCurrentSlides(prev => ({ ...prev, [brandId]: 0 }));
        return;
      }

      // Calculate current slide based on scroll percentage
      const scrollPercentage = scrollPosition / maxScroll;
      const newSlide = Math.round(scrollPercentage * (totalColumns - 1));
      
      setCurrentSlides(prev => ({ ...prev, [brandId]: newSlide }));
    }
  }, [productsByBrand]);

  const handleAddToCart = useCallback((e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const cartItem: CartItem = {
      productId: product.id,
      quantity: 1,
      product: {
        ...product,
        variants: product.variants || []
      }
    };
    addToCart(cartItem);
  }, [addToCart]);

  // Empty state
  if (!products.length) {
    return null;
  }

  return (
    <section className="pt-4 pb-20">
      <div className="space-y-6">
        {sortedBrandEntries.map(([brandId, brandProducts]) => {
          const brandTitle = brandsMap[brandId]?.title || 'Không xác định';
          const brandSlug = brandsMap[brandId]?.slug;
          
          return (
            <div key={brandId} className="space-y-3">
              <div className="flex items-center justify-between px-4">
                <Link href={brandSlug ? `/brands/${brandSlug}` : '#'} className="group">
                  <h2 className="text-lg font-semibold text-red-700 group-hover:underline">
                    Thương hiệu {brandTitle}
                  </h2>
                </Link>
                {brandProducts.length > 3 && (
                  <div className="flex gap-1">
                    {Array.from({ length: Math.ceil(brandProducts.length / 3) }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentSlides[brandId] === index 
                            ? 'bg-red-500 w-4' 
                            : 'bg-gray-300 w-2'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div 
                ref={el => {
                  scrollRefs.current[brandId] = el;
                }}
                onScroll={() => handleScroll(brandId)}
                className="flex gap-4 overflow-x-auto flex-nowrap snap-x snap-mandatory px-4 pb-4 scrollbar-hide"
              >
                {Array.from({ length: Math.ceil(brandProducts.length / 3) }).map((_, colIdx) => (
                  <div key={colIdx} className="w-[95%] min-w-[320px] mx-auto space-y-3 snap-center">
                    {brandProducts.slice(colIdx * 3, colIdx * 3 + 3).map((product) => (
                      <Link 
                        href={`/san-pham/${product.slug || product.id}`} 
                        key={product.id}
                        className="bg-white rounded-lg shadow overflow-hidden block"
                      >
                        <div className="flex items-center p-2">
                          <div className="relative w-20 h-20">
                            <Image
                              src={product.image_url || "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200&auto=format"}
                              alt={product.name}
                              fill
                              className="rounded-lg object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 ml-2">
                            <div className="font-medium text-sm line-clamp-2">
                              {product.name}
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-red-500 font-semibold">
                                  {formatCurrency(product.price)}
                                </span>
                                {product.original_price && product.original_price > product.price && (
                                  <span className="text-xs text-gray-500 line-through">
                                    {formatCurrency(product.original_price)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-0.5">
                                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.3 6.1,11.2 4.8,17.1 9.9,14.1 15,17.1 13.7,11.2 18.2,7.3 12.2,6.6 "/></svg>
                                  {(product.rating || 4.9).toFixed(1)}
                                </span>
                                <span>•</span>
                                <span>Đã bán {product.sold_count || 0}</span>
                              </div>
                              <button 
                                className="p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors duration-200"
                                aria-label="Thêm vào giỏ hàng"
                                onClick={(e) => handleAddToCart(e, product)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});

MobileFeatureProduct.displayName = 'MobileFeatureProduct';

export default MobileFeatureProduct; 