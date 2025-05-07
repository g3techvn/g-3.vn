'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const Header = () => {
  // Thêm state để quản lý hiển thị StickyNavbar
  const handleCategoriesClick = () => {
    // Tìm component StickyNavbar và gọi hàm mở rộng
    const event = new CustomEvent('toggleStickyNav', { detail: { open: true } });
    document.dispatchEvent(event);
  };

  // Thêm state cho sticky header
  const [isSticky, setIsSticky] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Xử lý cuộn trang để hiển thị/ẩn header
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      // Luôn hiển thị sticky header khi bắt đầu cuộn
      if (currentScrollY > 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlHeader);
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  return (
    <header className="bg-gray-100 py-2">
      {/* Top header with logo, search, hotline and account - Phần này sẽ trở thành sticky */}
      <div 
        className={`container mx-auto bg-white px-4 py-3 rounded-lg 
          ${isSticky ? 'fixed top-2 left-0 right-0 z-50 shadow-md px-4 md:mx-auto mx-0' : ''}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="h-12 w-auto text-red-600 font-bold text-xl">METROSHOP</div>
          </Link>
          
          {/* Search Bar */}
          <div className="hidden md:block flex-grow max-w-3xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Nhập từ khóa tìm sản phẩm..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Hotline */}
          <div className="hidden md:flex items-center">
            <div className="mr-2">
              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">HOTLINE:</div>
              <div className="text-lg font-bold text-black">0983 410 222</div>
            </div>
          </div>
          
          {/* User & Cart */}
          <div className="flex items-center space-x-5">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="text-gray-700 hover:text-red-600 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="min-w-[200px] bg-white rounded-md p-2 shadow-md">
                <DropdownMenu.Item className="px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md">
                  <Link href="/account" className="flex w-full">Tài khoản của tôi</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md">
                  <Link href="/orders" className="flex w-full">Đơn hàng của tôi</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                <DropdownMenu.Item className="px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md">
                  <Link href="/logout" className="flex w-full">Đăng xuất</Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            
            <Link href="/cart" className="text-gray-700 hover:text-red-600 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Tạo khoảng trống khi header ở trạng thái sticky */}
      {isSticky && <div className="h-20"></div>}
      
      {/* Main Navigation */}
      <div className="bg-gray-100 border-gray-200">
        <div className="container bg-white my-2 mx-auto px-4 rounded-lg">
          <div className="flex items-center justify-between">
            {/* Categories Menu - Đã sửa đổi để bỏ dropdown và kích hoạt StickyNavbar */}
            <div className="relative py-3">
              <button 
                onClick={handleCategoriesClick}
                className="flex items-center space-x-2 text-gray-800 font-medium cursor-pointer hover:text-red-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>DANH MỤC SẢN PHẨM</span>
              </button>
            </div>
            
            {/* Main Navigation Links */}
            <NavigationMenu.Root className="hidden md:flex">
              <NavigationMenu.List className="flex items-center space-x-1">
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-red-600 font-medium">
                    <Link href="/">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      TRANG CHỦ
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 font-medium">
                    <Link href="/cua-hang">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      CỬA HÀNG
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 font-medium">
                    <Link href="/huong-dan">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      HƯỚNG DẪN
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 font-medium">
                    <Link href="/chinh-sach">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      CHÍNH SÁCH
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 font-medium">
                    <Link href="/lien-he">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      LIÊN HỆ
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 font-medium">
                    <Link href="/about">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      GIỚI THIỆU
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </NavigationMenu.Root>
            
            {/* Social Media Links */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="https://facebook.com" aria-label="Facebook" className="text-gray-600 hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </Link>
              <Link href="https://twitter.com" aria-label="Twitter" className="text-gray-600 hover:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Link>
              <Link href="mailto:info@metroshop.vn" aria-label="Email" className="text-gray-600 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Link>
              <Link href="https://pinterest.com" aria-label="Pinterest" className="text-gray-600 hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </Link>
              <Link href="https://linkedin.com" aria-label="LinkedIn" className="text-gray-600 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="min-w-[200px] bg-white rounded-md p-2 shadow-md">
                  <DropdownMenu.Item className="px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md">
                    <Link href="/" className="flex w-full items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      TRANG CHỦ
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md">
                    <Link href="/cua-hang" className="flex w-full items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      CỬA HÀNG
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                  <DropdownMenu.Item className="px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md">
                    <Link href="/account" className="flex w-full items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      TÀI KHOẢN
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;