import * as React from 'react';
import { cn } from '@/utils/cn';
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

interface LogoBadgeProps {
  label: string;
  className?: string;
  aspectRatio?: number;
  children?: React.ReactNode;
}

export function LogoBadge({
  label,
  className,
  aspectRatio = 2,
  children,
}: LogoBadgeProps) {
  return (
    <div className={cn(
      "bg-white rounded flex items-center justify-center overflow-hidden", 
      className
    )}>
      <AspectRatioPrimitive.Root ratio={aspectRatio} className="w-full h-full">
        <div className="w-full h-full flex items-center justify-center">
          {children || <span className="text-gray-800 text-xs font-semibold">{label}</span>}
        </div>
      </AspectRatioPrimitive.Root>
    </div>
  );
} 