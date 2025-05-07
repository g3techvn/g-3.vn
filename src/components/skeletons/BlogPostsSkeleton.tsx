import React from 'react';
import { Card, CardHeader, CardContent, CardBadge } from '@/components/ui/Card';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Skeleton } from '@/components/ui/Skeleton';

export default function BlogPostsSkeleton() {
  // Số lượng bài blog skeleton hiển thị
  const postsCount = 4;
  
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 invisible">
          <span className="opacity-0">Hướng dẫn và đánh giá</span>
          <Skeleton className="h-8 w-64 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2" animation="shimmer" />
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: postsCount }).map((_, index) => (
            <div key={index} className="group">
              <Card>
                <CardHeader>
                  <AspectRatio ratio={16 / 9} className="bg-gray-200 relative">
                    <Skeleton className="absolute inset-0" animation="shimmer" />
                    
                    {/* Skeleton cho icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-1M8 18h12M8 14h12M8 10h4" />
                      </svg>
                    </div>
                    
                    {/* Badge skeleton với text */}
                    <CardBadge className="bg-white/80 text-transparent">
                      <Skeleton className="h-4 w-16" animation="shimmer" />
                    </CardBadge>
                  </AspectRatio>
                </CardHeader>
                
                <CardContent>
                  {/* Title skeleton - uppercase style */}
                  <div className="mb-3 line-clamp-2">
                    <Skeleton className="h-5 w-full mb-1" animation="shimmer" />
                    <Skeleton className="h-5 w-4/5" animation="shimmer" />
                  </div>
                  
                  {/* Excerpt skeleton */}
                  <div className="line-clamp-3 mb-3">
                    <Skeleton className="h-4 w-full mb-1" animation="shimmer" />
                    <Skeleton className="h-4 w-full mb-1" animation="shimmer" />
                    <Skeleton className="h-4 w-2/3" animation="shimmer" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 