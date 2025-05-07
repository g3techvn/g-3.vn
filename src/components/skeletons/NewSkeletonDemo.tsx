import React from 'react';
import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';

export default function NewSkeletonDemo() {
  return (
    <div className="p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6">Shimmer Skeleton Demo</h2>
      
      <div className="max-w-2xl space-y-6">
        {/* Card with shimmer effect */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-4 mb-6">
              <ShimmerSkeleton className="w-12 h-12" variant="rounded-full" />
              <div className="space-y-2 flex-1">
                <ShimmerSkeleton className="h-4 w-1/2" />
                <ShimmerSkeleton className="h-3 w-1/3" />
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-2/3" />
            </div>
            
            <ShimmerSkeleton className="h-40 w-full mb-4" variant="rounded-md" />
            
            <div className="flex justify-between">
              <ShimmerSkeleton className="h-8 w-20" variant="rounded-sm" />
              <ShimmerSkeleton className="h-8 w-20" variant="rounded-sm" />
            </div>
          </div>
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <ShimmerSkeleton className="h-40 w-full" />
              <div className="p-3">
                <ShimmerSkeleton className="h-4 w-3/4 mb-2" />
                <ShimmerSkeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 