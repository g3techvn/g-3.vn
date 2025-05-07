import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface ProductCardSkeletonProps {
  showMultipleImages?: boolean;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ 
  showMultipleImages = false 
}) => {
  return (
    <div className="bg-white rounded-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Discount badge skeleton */}
      <div className="absolute top-2 left-2 z-10">
        <Skeleton className="w-8 h-4 rounded-sm" animation="shimmer" />
      </div>
      
      {/* Product image skeleton */}
      <div className="relative pt-[100%]">
        {showMultipleImages ? (
          <div className="grid grid-cols-2 absolute inset-0">
            <div className="col-span-2 row-span-2 relative border-b border-gray-100">
              <Skeleton className="absolute inset-0 m-2" animation="shimmer" />
            </div>
            <div className="relative border-t border-gray-100">
              <Skeleton className="absolute inset-0 m-1" animation="shimmer" />
            </div>
            <div className="relative border-t border-gray-100">
              <Skeleton className="absolute inset-0 m-1" animation="shimmer" />
            </div>
          </div>
        ) : (
          <Skeleton className="absolute inset-0 m-2" animation="shimmer" />
        )}
      </div>
      
      {/* Product details skeleton */}
      <div className="p-3">
        {/* Brand skeleton */}
        <Skeleton className="h-3 w-1/3 mb-1" animation="shimmer" />
        
        {/* Name skeleton with sku pattern */}
        <div className="mb-1 h-10">
          <div className="flex items-center">
            <Skeleton className="h-3 w-12 mr-1 rounded-sm" animation="shimmer" /> {/* sku */}
            <Skeleton className="h-3 w-3/5 rounded-sm" animation="shimmer" /> {/* name part 1 */}
          </div>
          <Skeleton className="h-3 w-full mt-1 rounded-sm" animation="shimmer" /> {/* name part 2 */}
          <Skeleton className="h-3 w-4/5 mt-1 rounded-sm" animation="shimmer" /> {/* name part 3 */}
        </div>
        
        {/* Rating skeleton */}
        <div className="flex mb-2 gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="w-3 h-3 rounded-full" animation="shimmer" />
          ))}
        </div>
        
        {/* Price skeleton */}
        <div className="flex flex-col">
          <Skeleton className="h-3 w-1/4 mb-0.5" animation="shimmer" /> {/* Original price */}
          <Skeleton className="h-4 w-1/3" animation="shimmer" /> {/* Discounted price */}
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton; 