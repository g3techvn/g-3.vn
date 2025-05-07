import * as React from 'react';
import Link from 'next/link';
import { Slot } from './Slot';
import { cn } from '@/utils/cn';

interface FooterLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  asChild?: boolean;
}

const FooterLink = React.forwardRef<
  React.ElementRef<typeof Link>,
  FooterLinkProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : Link;
  return (
    <Comp
      ref={ref}
      className={cn(
        "text-gray-400 hover:text-white transition-colors duration-200",
        className
      )}
      {...props}
    />
  );
});
FooterLink.displayName = "FooterLink";

export { FooterLink }; 