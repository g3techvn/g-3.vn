import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  discount?: number;
  image: string;
  images?: string[];
  brand: string;
  rating?: number;
  url: string;
}

interface ProductTabsProps {
  title: string;
  tabs: {
    id: string;
    name: string;
    products: Product[];
  }[];
}

// Tách ProductCard component riêng để giảm thiểu render lại
const ProductCard = React.memo(({ product, handleImageError, hasError }: { 
  product: Product, 
  handleImageError: (id: number) => void,
  hasError: boolean
}) => {
  return (
    <div className="bg-white rounded-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Discount badge */}
      {product.discount && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold rounded-sm z-10 px-1.5 py-0.5">
          -{product.discount}%
        </div>
      )}
      
      {/* Product image */}
      <Link href={product.url} className="block relative pt-[100%]">
        {hasError ? (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-gray-700 font-semibold text-sm mb-1">{product.name}</div>
              <div className="text-gray-500 text-xs">{product.brand}</div>
              <div className="text-xs text-red-600 mt-2">[{product.sku}]</div>
            </div>
          </div>
        ) : product.images && product.images.length > 1 ? (
          <div className="grid grid-cols-2 absolute inset-0">
            <div className="col-span-2 row-span-2 relative border-b border-gray-100">
              <Image
                src={product.images[0]}
                alt={`${product.name} - ảnh chính`}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 50vw, 16vw"
                onError={() => handleImageError(product.id)}
                loading="lazy"
              />
            </div>
            {product.images.slice(1, 3).map((img, index) => (
              <div key={index} className="relative border-t border-gray-100">
                <Image
                  src={img}
                  alt={`${product.name} - ảnh ${index + 2}`}
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 25vw, 8vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 50vw, 16vw"
            onError={() => handleImageError(product.id)}
            loading="lazy"
          />
        )}
      </Link>
      
      {/* Product details */}
      <div className="p-3">
        <Link href={product.url} className="block">
          <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
          <h3 className="text-xs font-medium line-clamp-2 mb-1 h-10 text-gray-800">
            <span className="text-gray-500">[{product.sku}]</span> {product.name}
          </h3>
          
          {/* Rating */}
          <ProductRating rating={product.rating || 0} />
          
          {/* Prices */}
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-xs mb-0.5">
                {product.originalPrice.toLocaleString('vi-VN')}
              </span>
            )}
            <span className="font-semibold text-red-600">
              {product.price.toLocaleString('vi-VN')}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// Tách ProductRating thành component riêng để dễ tái sử dụng
const ProductRating = ({ rating }: { rating: number }) => (
  <div className="flex mb-2">
    {Array.from({ length: 5 }).map((_, index) => (
      <svg 
        key={index} 
        className={`w-3 h-3 ${index < rating ? 'text-yellow-400' : 'text-gray-200'}`} 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// Tách PaginationControls thành component riêng
const PaginationControls = ({ 
  onPrev, 
  onNext 
}: { 
  tabId?: string, // Chuyển thành optional
  totalPages?: number, // Chuyển thành optional
  onPrev: () => void, 
  onNext: () => void 
}) => (
  <div className="flex ml-auto">
    <button 
      onClick={onPrev}
      className="bg-white border border-gray-300 rounded-sm p-1 hover:bg-gray-100 mr-1"
      aria-label="Previous page"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
    
    <button 
      onClick={onNext}
      className="bg-white border border-gray-300 rounded-sm p-1 hover:bg-gray-100"
      aria-label="Next page"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  </div>
);

export default function ProductTabsRadix({ title, tabs }: ProductTabsProps) {
  const productsPerPage = 6;
  const [currentTab, setCurrentTab] = useState<string>(tabs[0]?.id || '');
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  // Reset pagination when tabs change
  useEffect(() => {
    setCurrentPages({});
  }, [tabs]);
  
  const getPage = (tabId: string) => currentPages[tabId] || 0;
  
  const setPage = (tabId: string, page: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabId]: page
    }));
  };
  
  const nextPage = (tabId: string, totalPages: number) => {
    setPage(tabId, (getPage(tabId) + 1) % totalPages);
  };
  
  const prevPage = (tabId: string, totalPages: number) => {
    setPage(tabId, (getPage(tabId) - 1 + totalPages) % totalPages);
  };

  const handleImageError = (productId: number) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  // Tính toán sản phẩm hiển thị cho mỗi tab một lần duy nhất khi cần thiết
  const tabProducts = useMemo(() => {
    return tabs.reduce((acc, tab) => {
      const currentPage = getPage(tab.id);
      acc[tab.id] = tab.products.slice(
        currentPage * productsPerPage, 
        (currentPage + 1) * productsPerPage
      );
      return acc;
    }, {} as Record<string, Product[]>);
  }, [tabs, currentPages, productsPerPage]);

  // Tính toán số trang cho mỗi tab
  const tabPageCounts = useMemo(() => {
    return tabs.reduce((acc, tab) => {
      acc[tab.id] = Math.ceil(tab.products.length / productsPerPage);
      return acc;
    }, {} as Record<string, number>);
  }, [tabs, productsPerPage]);

  // Sử dụng onValueChange callback của Radix Tabs để theo dõi tab hiện tại
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  const memoizedProducts = useMemo(() => {
    // ... existing code ...
  }, [getPage]);

  return (
    <section className="py-10 bg-gray-100">
      <div className="container mx-auto">
        <div className=" pb-1 mb-6">
          <Tabs 
            defaultValue={tabs[0]?.id} 
            className="w-full"
            value={currentTab}
            onValueChange={handleTabChange}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-gray-900 uppercase border-b-[3px] border-red-600 pb-1 mr-6">
                  {title}
                </h2>
                
                <TabsList className="bg-transparent h-auto p-0 mb-1">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="px-2 py-2 text-sm font-medium whitespace-nowrap relative rounded-none 
                        data-[state=active]:text-red-600 data-[state=active]:font-semibold 
                        data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                    >
                      {tab.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {/* Hiển thị controls phân trang chỉ cho tab đang active */}
              {tabs.map((tab) => {
                const totalPages = tabPageCounts[tab.id] || 1;
                
                return tab.id === currentTab && totalPages > 1 ? (
                  <PaginationControls
                    key={`nav-${tab.id}`}
                    tabId={tab.id}
                    totalPages={totalPages}
                    onPrev={() => prevPage(tab.id, totalPages)}
                    onNext={() => nextPage(tab.id, totalPages)}
                  />
                ) : null;
              })}
            </div>
            
            {/* Nội dung các tab */}
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {tabProducts[tab.id]?.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      handleImageError={handleImageError}
                      hasError={!!imageErrors[product.id]}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
} 