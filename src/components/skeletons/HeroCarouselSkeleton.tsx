import React from 'react';
import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';

export default function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      <ShimmerSkeleton className="absolute inset-0" />
      
      {/* Dots skeleton */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full ${
              index === 0 ? 'w-8 bg-gray-400' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
      
      {/* Controls skeleton */}
      <div className="absolute inset-y-0 left-2 flex items-center">
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-500 transform -rotate-45"></div>
        </div>
      </div>
      
      <div className="absolute inset-y-0 right-2 flex items-center">
        <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
          <div className="w-4 h-4 border-r-2 border-t-2 border-gray-500 transform -rotate-45"></div>
        </div>
      </div>
    </div>
  );
} 