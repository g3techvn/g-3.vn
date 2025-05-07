import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { ShimmerSkeleton } from '@/components/ui/ShimmerSkeleton';
import { cn } from '@/utils/cn';

interface TabsSkeletonProps {
  tabCount?: number;
  tabWidthClass?: string;
  showTitle?: boolean;
  titleWidthClass?: string;
  showControls?: boolean;
}

export function TabsSkeleton({
  tabCount = 3,
  tabWidthClass = 'w-16',
  showTitle = true,
  titleWidthClass = 'w-40',
  showControls = true
}: TabsSkeletonProps) {
  return (
    <Tabs defaultValue="tab-1" className="w-full">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center mb-2 sm:mb-0">
          {/* Title skeleton */}
          {showTitle && (
            <div className="text-xl font-bold text-gray-900 uppercase border-b-[3px] border-red-600 pb-1 mr-3 sm:mr-6 flex">
              <ShimmerSkeleton className={cn('h-6 sm:h-7', titleWidthClass)} />
            </div>
          )}
          
          <TabsList className="bg-transparent h-auto p-0 mb-1 overflow-x-auto">
            {Array.from({ length: tabCount }).map((_, index) => (
              <TabsTrigger
                key={`tab-${index + 1}`}
                value={`tab-${index + 1}`}
                className="px-2 py-1 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap relative rounded-none data-[state=active]:text-red-600 data-[state=active]:font-semibold"
                disabled={index !== 0} // First tab is active
              >
                <ShimmerSkeleton className={cn('h-3 sm:h-4', tabWidthClass)} />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {/* Pagination controls skeleton */}
        {showControls && (
          <div className="flex ml-auto mt-2 sm:mt-0">
            <div className="bg-white border border-gray-300 rounded-sm p-1 hover:bg-gray-100 mr-1 opacity-60">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </div>
            
            <div className="bg-white border border-gray-300 rounded-sm p-1 hover:bg-gray-100 opacity-60">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Tab content skeleton */}
      <TabsContent value="tab-1" className="mt-4">
        {/* Content will be provided by the parent component */}
      </TabsContent>
    </Tabs>
  );
}

export default TabsSkeleton; 