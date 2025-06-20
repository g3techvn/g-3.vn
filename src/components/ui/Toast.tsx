'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

export function Toast({ 
  message, 
  type = 'error', 
  duration = 5000, 
  onClose,
  show = false 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!mounted || !isVisible) return null;

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toastElement = (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div 
        className={`flex items-center p-4 rounded-lg shadow-lg ${typeStyles[type]} animate-slide-in-right`}
        role="alert"
      >
        <div className="flex-shrink-0 mr-3">
          <span className="text-lg font-bold">{typeIcons[type]}</span>
        </div>
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        <button
          onClick={handleClose}
          className="ml-3 flex-shrink-0 text-white hover:text-gray-200 focus:outline-none"
          aria-label="Đóng thông báo"
        >
          <span className="text-lg">&times;</span>
        </button>
      </div>
    </div>
  );

  return createPortal(toastElement, document.body);
}

// Hook for using toast functionality
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastProps['type'];
    show: boolean;
  }>({
    message: '',
    type: 'info',
    show: false
  });

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    setToast({ message, type, show: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const ToastComponent = () => (
    <Toast
      message={toast.message}
      type={toast.type}
      show={toast.show}
      onClose={hideToast}
    />
  );

  return {
    showToast,
    hideToast,
    ToastComponent
  };
} 