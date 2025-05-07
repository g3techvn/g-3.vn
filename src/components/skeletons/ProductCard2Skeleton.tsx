import React from 'react';
import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';

interface ProductCard2SkeletonProps {
  showMultipleImages?: boolean;
}

const ProductCard2Skeleton: React.FC<ProductCard2SkeletonProps> = ({ 
  showMultipleImages = false 
}) => {
  return (
    <div className="bg-white rounded-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden h-full">
      {/* Discount badge skeleton */}
      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 z-10">
        <ShimmerSkeleton className="w-5 xs:w-6 sm:w-8 h-2.5 xs:h-3 sm:h-4" variant="rounded-sm" />
      </div>
      
      {/* Product image skeleton */}
      <div className="relative pt-[100%]">
        {showMultipleImages ? (
          <div className="grid grid-cols-2 absolute inset-0">
            <div className="col-span-2 row-span-2 relative border-b border-gray-100">
              <ShimmerSkeleton className="absolute inset-0 m-0.5 xs:m-1 sm:m-2" />
            </div>
            <div className="relative border-t border-gray-100">
              <ShimmerSkeleton className="absolute inset-0 m-0.5 sm:m-1" />
            </div>
            <div className="relative border-t border-gray-100">
              <ShimmerSkeleton className="absolute inset-0 m-0.5 sm:m-1" />
            </div>
          </div>
        ) : (
          <ShimmerSkeleton className="absolute inset-0 m-0.5 xs:m-1 sm:m-2" />
        )}
      </div>
      
      {/* Product details skeleton */}
      <div className="p-1.5 xs:p-2 sm:p-3">
        {/* Brand skeleton */}
        <ShimmerSkeleton className="h-2 xs:h-2.5 sm:h-3 w-1/3 mb-0.5 xs:mb-1" />
        
        {/* Name skeleton with sku pattern */}
        <div className="mb-1 h-6 xs:h-8 sm:h-10">
          <div className="flex items-center">
            <ShimmerSkeleton className="h-2 xs:h-2.5 sm:h-3 w-8 xs:w-10 sm:w-12 mr-1" variant="rounded-sm" /> {/* sku */}
            <ShimmerSkeleton className="h-2 xs:h-2.5 sm:h-3 w-3/5" variant="rounded-sm" /> {/* name part 1 */}
          </div>
          <ShimmerSkeleton className="h-2 xs:h-2.5 sm:h-3 w-full mt-0.5 sm:mt-1" variant="rounded-sm" /> {/* name part 2 */}
          <ShimmerSkeleton className="h-2 xs:h-2.5 sm:h-3 w-4/5 mt-0.5 sm:mt-1" variant="rounded-sm" /> {/* name part 3 */}
        </div>
        
        {/* Rating skeleton */}
        <div className="flex mb-0.5 xs:mb-1 sm:mb-2 gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <ShimmerSkeleton key={index} className="w-1.5 xs:w-2 sm:w-3 h-1.5 xs:h-2 sm:h-3" variant="rounded-full" />
          ))}
        </div>
        
        {/* Price skeleton */}
        <div className="flex flex-col">
          <ShimmerSkeleton className="h-2 xs:h-2.5 sm:h-3 w-1/4 mb-0.5" /> {/* Original price */}
          <ShimmerSkeleton className="h-2.5 xs:h-3 sm:h-4 w-1/3" /> {/* Discounted price */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard2Skeleton; 