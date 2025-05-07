import * as React from 'react';
import { cn } from '@/utils/cn';

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FooterSection({
  title,
  children,
  className,
  id,
}: FooterSectionProps) {
  return (
    <div className={cn("", className)}>
      <h3 className="text-lg font-bold mb-4" id={id}>{title}</h3>
      {children}
    </div>
  );
} 