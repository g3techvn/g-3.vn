import React from 'react';
import { cn } from '@/utils/cn';

interface ShimmerSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Kiểu skeleton: rounded-md (mặc định), rounded-sm, rounded-full, hoặc rounded-none
   */
  variant?: 'rounded-md' | 'rounded-sm' | 'rounded-full' | 'rounded-none';
}

// Keyframes inline cho hiệu ứng shimmer
const shimmerAnimation = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const ShimmerSkeleton = React.forwardRef<HTMLDivElement, ShimmerSkeletonProps>(
  ({ className, variant = 'rounded-md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-gray-200",
          variant,
          className
        )}
        {...props}
      >
        {/* Style inline cho animation */}
        <style>{shimmerAnimation}</style>
        
        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            transform: 'translateX(-100%)',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
    );
  }
);

ShimmerSkeleton.displayName = "ShimmerSkeleton";

export { ShimmerSkeleton }; 