import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Xác định loại hiệu ứng cho skeleton
   * - 'none': Không có hiệu ứng
   * - 'pulse': Hiệu ứng pulse nhấp nháy
   * - 'shimmer': Hiệu ứng lướt từ trái qua phải
   * @default 'none'
   */
  animation?: 'none' | 'pulse' | 'shimmer';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, animation = 'none', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md bg-gray-200",
          {
            "animate-pulse": animation === 'pulse',
            "skeleton-shimmer": animation === 'shimmer',
          },
          className
        )}
        style={animation === 'shimmer' ? {
          // Thêm inline style để đảm bảo hiệu ứng hoạt động
          backgroundImage: "linear-gradient(90deg, rgba(227, 227, 227, 0.5) 0%, rgba(227, 227, 227, 1) 50%, rgba(227, 227, 227, 0.5) 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2s infinite linear"
        } : undefined}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton }; 