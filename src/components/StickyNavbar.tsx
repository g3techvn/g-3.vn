'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { COMPANY_INFO } from '@/constants';

// Định nghĩa hàm cn inline để tránh lỗi import
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hàm định dạng số điện thoại
function formatPhoneNumber(phoneNumber: string) {
  // Xóa tất cả ký tự không phải số
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Định dạng: XXX XXX XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }
  return phoneNumber;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  subCategories?: { id: string; name: string; href: string }[];
}

const categories: Category[] = [
  {
    id: 'ergonomic-chair',
    name: 'GHẾ CÔNG THÁI HỌC',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11.5a2.5 2.5 0 015 0v5a2.5 2.5 0 01-5 0v-5zM12 9.5V4.5a2.5 2.5 0 015 0v5a2.5 2.5 0 01-5 0zM19 11.5a2.5 2.5 0 015 0v5a2.5 2.5 0 01-5 0v-5z" />
      </svg>
    ),
    href: '#',
  },
  {
    id: 'adjustable-desk',
    name: 'BÀN NÂNG HẠ',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    href: '#',
  },
  {
    id: 'kids-furniture',
    name: 'BÀN GHẾ TRẺ EM',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    href: '#',
  },
  {
    id: 'accessories',
    name: 'PHỤ KIỆN',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    href: '#',
  },
];

export default function StickyNavbar() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [showText, setShowText] = useState(false);
  
  // Effect to handle scroll behavior and make the navbar sticky
  useEffect(() => {
    const handleScroll = () => {
      // Không cần thay đổi trạng thái isSticky khi cuộn
      // Chỉ sử dụng hover để kích hoạt
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Thêm effect để lắng nghe sự kiện từ Header
  useEffect(() => {
    const handleToggleNav = (event: CustomEvent) => {
      // Chỉ xử lý sự kiện trên thiết bị không phải di động
      if (window.matchMedia('(min-width: 768px)').matches) {
        if (event.detail && event.detail.open) {
          setIsSticky(true);
        }
      }
    };

    document.addEventListener('toggleStickyNav', handleToggleNav as EventListener);
    
    return () => {
      document.removeEventListener('toggleStickyNav', handleToggleNav as EventListener);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSticky) {
      // Đợi 300ms (thời gian transition) trước khi hiển thị text
      timer = setTimeout(() => {
        setShowText(true);
      }, 300);
    } else {
      // Ẩn text ngay lập tức khi bắt đầu thu gọn
      setShowText(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isSticky]);

  const handleMouseEnter = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    setActiveCategory(null);
  };

  return (
    <div className="hidden md:block">
      {/* Overlay khi menu mở rộng - áp dụng hiệu ứng glassmorphism */}
      <div 
        className={cn(
          "fixed inset-0 backdrop-blur-sm bg-black/30 transition-all duration-300 z-[100]",
          isSticky ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSticky(false)}
      />
      
      <div 
        className={cn(
          "fixed left-0 top-0 z-[101] bg-white shadow-lg transition-all duration-300 overflow-hidden h-screen flex flex-col",
          isSticky ? "w-[250px]" : "w-[60px]"
        )}
        onMouseEnter={() => setIsSticky(true)}
        onMouseLeave={() => setIsSticky(false)}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            "bg-white py-4 px-4 text-red-600 font-medium transition-all duration-300 h-14 flex items-center",
            isSticky ? "px-4" : "px-0 justify-center"
          )}>
            <span className={cn(
              "bg-red-600 rounded-full p-1 flex items-center",
              showText && "px-3 w-full"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className={cn(
                "text-white text-sm font-medium transition-all duration-300 whitespace-nowrap",
                showText ? "opacity-100 ml-3" : "opacity-0 ml-0 w-0 overflow-hidden"
              )}>DANH MỤC SẢN PHẨM</span>
            </span>
          </div>
          
          <ul className="py-2 flex-1 overflow-y-auto">
            {categories.map((category) => (
              <li 
                key={category.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
              >
                <Link 
                  href={category.href}
                  className={cn(
                    "flex items-center py-3 hover:bg-gray-100 transition-colors",
                    isSticky ? "px-4" : "px-0 justify-center"
                  )}
                >
                  <span className={cn(
                    "text-gray-500",
                    !isSticky && "mx-auto"
                  )}>{category.icon}</span>
                  <span className={cn(
                    "text-sm font-medium transition-all duration-300 whitespace-nowrap",
                    showText ? "opacity-100 ml-3" : "opacity-0 ml-0 w-0 overflow-hidden"
                  )}>{category.name}</span>
                  {category.subCategories && showText && (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-auto text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>
                
                {category.subCategories && activeCategory === category.id && showText && (
                  <div className="absolute left-full top-0 w-[250px] bg-white shadow-lg rounded-r-lg overflow-hidden z-50">
                    <ul className="py-2">
                      {category.subCategories.map((subCategory) => (
                        <li key={subCategory.id}>
                          <Link 
                            href={subCategory.href}
                            className="block px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
                          >
                            {subCategory.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className={cn(
          "bg-gray-100 py-2 px-4 transition-all duration-300 absolute bottom-0 left-0 right-0",
          !showText && "hidden"
        )}>
          <div className="px-2">
            <a 
              href={`tel:${COMPANY_INFO.hotline}`}
              className="flex flex-col text-red-600 font-medium text-sm mb-3 border-2 border-red-600 rounded-lg p-3 shadow-sm w-full"
            >
              <span className="inline-flex items-center justify-center mb-1">
                <span className="bg-red-600 rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                HOTLINE
              </span>
              <span className="text-center text-lg font-semibold">{formatPhoneNumber(COMPANY_INFO.hotline)}</span>
            </a>
          </div>
          
          <div className="flex flex-col space-y-2 mb-2 items-center px-2">
            <Link 
              href="https://apps.apple.com" 
              target="_blank" 
              className="flex items-center bg-gray-800 text-white text-xs rounded-md px-3 py-2 hover:bg-black transition-colors w-full justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[0.6rem] leading-tight opacity-80">Tải trên</span>
                <span className="font-semibold">App Store</span>
              </div>
            </Link>
            
            <Link 
              href="https://play.google.com" 
              target="_blank" 
              className="flex items-center bg-gray-800 text-white text-xs rounded-md px-3 py-2 hover:bg-black transition-colors w-full justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[0.6rem] leading-tight opacity-80">Tải trên</span>
                <span className="font-semibold">Google Play</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 