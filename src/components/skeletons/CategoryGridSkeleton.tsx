import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CategoryGridSkeleton() {
  // Số lượng danh mục hiển thị dựa trên grid md:grid-cols-5
  const categoriesCount = 10;
  
  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: categoriesCount }).map((_, index) => (
            <div key={index} className="group transform transition-all duration-200 hover:-translate-y-1">
              <Card className="h-full bg-gray-300 hover:bg-gray-200">
                <CardContent className="flex items-center justify-between w-full p-4">
                  <div className="flex-1 text-left mr-3">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-full rounded-sm" animation="shimmer" />
                      <Skeleton className="h-3.5 w-2/3 rounded-sm" animation="shimmer" />
                    </div>
                  </div>
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white shadow-sm flex-shrink-0 flex items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-md" animation="shimmer" />
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