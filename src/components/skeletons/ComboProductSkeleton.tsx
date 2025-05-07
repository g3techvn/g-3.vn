import React from 'react';
import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';

export default function ComboProductSkeleton() {
  return (
    <div className="py-10 bg-gray-100">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-6">
          <ShimmerSkeleton className="h-8 w-64 mb-4" />
          <ShimmerSkeleton className="h-40 w-full max-w-4xl rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-md">
              <ShimmerSkeleton className="h-48 w-full mb-4" />
              <ShimmerSkeleton className="h-5 w-3/4 mb-2" />
              <ShimmerSkeleton className="h-4 w-1/2 mb-2" />
              <ShimmerSkeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 