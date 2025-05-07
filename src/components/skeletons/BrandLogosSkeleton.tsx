import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function BrandLogosSkeleton() {
  // Số lượng logo thương hiệu giống như trong component thực
  const brandCount = 7;
  
  // Danh sách độ rộng khác nhau để tạo sự đa dạng
  const widths = ["w-24", "w-20", "w-28", "w-24", "w-20", "w-24", "w-28"];
  
  return (
    <section className="py-8 bg-gray-100 border-y border-gray-100">
      <div className="container bg-white mx-auto px-4 rounded-lg py-4">
        <div className="flex flex-wrap items-center justify-center md:justify-between">
          {Array.from({ length: brandCount }).map((_, index) => (
            <div key={index} className="mx-4 md:mx-0 my-3 transform transition-all duration-200 hover:scale-105">
              <div className="h-8 flex items-center justify-center overflow-hidden">
                <Skeleton className={`h-6 ${widths[index % widths.length]}`} animation="shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 