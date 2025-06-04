import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCartIcon, ChevronLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ProductHeaderProps {
  publisher: string;
  brandSlug?: string;
  brandImageUrl?: string;
  totalCartItems: number;
  onShareClick: () => void;
  onFeedbackClick: () => void;
}

export function ProductHeader({ 
  publisher, 
  brandSlug, 
  brandImageUrl,
  totalCartItems, 
  onShareClick, 
  onFeedbackClick 
}: ProductHeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 bg-[#f5f5f5] border-b border-gray-200">
      <div className="flex items-center h-14 px-2 relative">
        <button
          onClick={() => {
            if (brandSlug) {
              router.push(`/brands/${brandSlug}`);
            } else {
              router.back();
            }
          }}
          className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        
        <div className="absolute left-0 right-0 top-0 h-14 flex items-center justify-center pointer-events-none">
          {brandImageUrl ? (
            <div className="relative w-32 h-8">
              <Image
                src={brandImageUrl}
                alt={publisher}
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
          ) : (
            <span className="font-bold text-lg text-red-700 tracking-wide pointer-events-none">
              {publisher.toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2">
          <button
            onClick={() => router.push('/gio-hang')}
            className="w-10 h-10 flex items-center justify-center text-gray-600 relative"
          >
            <ShoppingCartIcon className="w-6 h-6" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-gray-600"
          >
            <EllipsisVerticalIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Context Menu */}
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <button 
                  onClick={() => {
                    onShareClick();
                    setIsMenuOpen(false);
                  }} 
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Chia sẻ
                </button>
                <button 
                  onClick={() => {
                    onFeedbackClick();
                    setIsMenuOpen(false);
                  }} 
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Góp ý
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 