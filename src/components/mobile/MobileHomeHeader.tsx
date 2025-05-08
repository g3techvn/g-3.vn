import React from 'react';
import Image from 'next/image';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';

const MobileHomeHeader: React.FC = () => {
  const isVisible = useHeaderVisibility();

  return (
    <div 
      className={`flex items-center justify-between px-4 pt-3 pb-2 bg-white sticky top-0 z-30 transition-transform duration-200 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Logo Google Play */}
      <div className="flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#fff"/>
          <path d="M6 5.5V26.5C6 27.3284 6.67157 28 7.5 28C7.82322 28 8.13807 27.8946 8.38268 27.7071L25.3827 15.7071C26.0597 15.1962 26.0597 14.1962 25.3827 13.6853L8.38268 1.68531C8.13807 1.4978 7.82322 1.39236 7.5 1.39236C6.67157 1.39236 6 2.06393 6 2.89236V5.5Z" fill="#34A853"/>
        </svg>
      </div>
      {/* Search bar giả lập */}
      <div className="flex-1 mx-2">
        <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center">
          <span className="text-gray-500 text-sm">Tìm kiếm sản phẩm</span>
        </div>
      </div>
      {/* Icon */}
      <div className="flex items-center gap-3">
        <button className="text-gray-600">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="1"/></svg>
        </button>
        <button className="text-gray-600">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
        </button>
        <button className="ml-1">
          <div className="relative w-8 h-8">
            <Image 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
              alt="avatar" 
              fill
              className="rounded-full object-cover" 
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default MobileHomeHeader; 