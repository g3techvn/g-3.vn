import * as React from 'react';
import * as SlotPrimitive from '@radix-ui/react-slot';
import { cn } from '@/utils/cn';

const Slot = React.forwardRef<
  React.ElementRef<typeof SlotPrimitive.Slot>,
  React.ComponentPropsWithoutRef<typeof SlotPrimitive.Slot>
>(({ className, ...props }, ref) => (
  <SlotPrimitive.Slot
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
Slot.displayName = SlotPrimitive.Slot.displayName;

export { Slot }; 