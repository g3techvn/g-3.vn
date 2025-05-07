import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import ProductCardSkeleton from './ProductCardSkeleton';

// Tách PaginationControlsSkeleton thành component riêng
const PaginationControlsSkeleton = () => (
  <div className="flex ml-auto">
    <div className="bg-white border border-gray-300 rounded-sm p-1 hover:bg-gray-100 mr-1 opacity-60">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </div>
    
    <div className="bg-white border border-gray-300 rounded-sm p-1 hover:bg-gray-100 opacity-60">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  </div>
);

export default function ProductTabsRadixSkeleton() {
  // Số lượng tabs skeleton
  const tabCount = 3;
  // Số lượng sản phẩm skeleton hiển thị
  const productsPerPage = 6;
  
  return (
    <section className="py-10 bg-gray-100">
      <div className="container mx-auto">
        <div className="pb-1 mb-6">
          <Tabs defaultValue="tab-1" className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* Title skeleton */}
                <div className="text-xl font-bold text-gray-900 uppercase border-b-[3px] border-red-600 pb-1 mr-6 flex">
                  <Skeleton className="h-7 w-40" animation="shimmer" />
                </div>
                
                <TabsList className="bg-transparent h-auto p-0 mb-1">
                  {Array.from({ length: tabCount }).map((_, index) => (
                    <TabsTrigger
                      key={`tab-${index + 1}`}
                      value={`tab-${index + 1}`}
                      className="px-2 py-2 text-sm font-medium whitespace-nowrap relative rounded-none data-[state=active]:text-red-600 data-[state=active]:font-semibold"
                      disabled={index !== 0} // First tab is active
                    >
                      <Skeleton className="h-4 w-16" animation="shimmer" />
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {/* Pagination controls skeleton */}
              <PaginationControlsSkeleton />
            </div>
            
            {/* Tab content skeleton */}
            <TabsContent value="tab-1" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: productsPerPage }).map((_, index) => (
                  <ProductCardSkeleton 
                    key={index}
                    showMultipleImages={index % 3 === 0} // Chỉ một số sản phẩm hiển thị nhiều ảnh
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
} 