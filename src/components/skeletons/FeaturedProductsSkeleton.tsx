import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export default function FeaturedProductsSkeleton() {
  const productsPerSlide = 4;
  
  return (
    <section className="py-10 bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto">
        <Skeleton className="h-8 w-48 mb-8" animation="shimmer" /> {/* Title */}
        
        <div className="relative">
          {/* Navigation buttons */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-10 flex justify-between pointer-events-none">
            <button 
              className="bg-white rounded-full p-2 shadow-md pointer-events-none opacity-70"
              type="button"
              disabled
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            <button 
              className="bg-white rounded-full p-2 shadow-md pointer-events-none opacity-70"
              type="button"
              disabled
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Bọc trong component Tabs */}
          <Tabs defaultValue="skeleton-tab">
            {/* TabsList giả lập */}
            <TabsList className="sr-only">
              <TabsTrigger value="skeleton-tab">Slide</TabsTrigger>
            </TabsList>
            
            {/* Products carousel */}
            <TabsContent
              value="skeleton-tab"
              className="m-0"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: productsPerSlide }).map((_, index) => (
                  <div key={index} className="bg-white overflow-hidden rounded-lg shadow-md">
                    <div className="relative h-64 overflow-hidden">
                      <Skeleton className="absolute inset-0" animation="shimmer" />
                    </div>
                    <div className="p-4 text-center">
                      <Skeleton className="h-4 w-16 mx-auto mb-1" animation="shimmer" /> {/* Category */}
                      <Skeleton className="h-5 w-32 mx-auto mb-1" animation="shimmer" /> {/* Name */}
                      <div className="flex justify-center mt-2">
                        <Skeleton className="h-6 w-24 rounded-full" animation="shimmer" /> {/* Button */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Slide indicators */}
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full ${
                  index === 0 ? 'w-8 bg-gray-400' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 