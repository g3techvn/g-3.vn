import { useState } from 'react';
import type { ToastProps } from '@/components/ui/Toast';

interface ToastState {
  message: string;
  variant: 'default' | 'destructive';
  show: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    variant: 'default',
    show: false
  });

  const showToast = (message: string, variant: ToastState['variant'] = 'default') => {
    setToast({ message, variant, show: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return {
    toast,
    showToast,
    hideToast
  };
} 