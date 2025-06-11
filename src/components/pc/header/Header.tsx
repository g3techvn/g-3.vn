'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { COMPANY_INFO, SOCIAL_LINKS } from '../../../constants';
import { useCart } from '../../../context/CartContext';
import ProfileDrawer from '../../store/ProfileDrawer';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';

/**
 * Format phone number with spaces
 * Example: 0979983355 -> 0979 983 355
 */
const formatPhoneNumber = (phone: string) => {
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

/**
 * Header Component
 * Main header component containing:
 * - Top header with logo, search, hotline and account
 * - Main navigation menu
 * - Mobile responsive menu
 */
const Header: React.FC = () => {
  // State management
  const [isSticky, setIsSticky] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { openCart, totalItems } = useCart();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { products = [], loading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const openProfile = () => {
    setIsProfileOpen(true);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  /**
   * Handle categories menu click
   * Dispatches custom event to toggle sticky navigation
   */
  const handleCategoriesClick = () => {
    const event = new CustomEvent('toggleStickyNav', { detail: { open: true } });
    document.dispatchEvent(event);
  };

  /**
   * Handle scroll behavior for sticky header
   * Shows sticky header when scrolling down
   */
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    );
    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleProductClick = (product: Product) => {
    setShowResults(false);
    setSearchQuery('');
    router.push(`/san-pham/${product.slug || product.id}`);
  };

  return (
    <header className="bg-gray-100 py-2">
      {/* Profile Drawer */}
      <ProfileDrawer isOpen={isProfileOpen} onClose={closeProfile} />
      
      {/* Top Header Section */}
      <div 
        className={`container mx-auto bg-gray-100/30 backdrop-blur-md px-4 py-3 rounded-lg 
          ${isSticky ? 'fixed top-2 left-0 translate-x-16 right-16 z-50 shadow-md px-4 md:mx-auto mx-0' : ''}`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo-g3.svg"
              alt="G3 Logo"
              width={120}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>
          
          {/* Search Bar - Desktop Only */}
          <div className="hidden md:block flex-grow max-w-3xl mx-8">
            <div ref={searchRef} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Nhập từ khóa tìm sản phẩm..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-[60vh] overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <div className="w-12 h-12 relative flex-shrink-0">
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-red-600 font-semibold">
                                {product.price.toLocaleString()}₫
                              </div>
                              {product.original_price && product.original_price > product.price && (
                                <div className="text-xs text-gray-400 line-through">
                                  {product.original_price.toLocaleString()}₫
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Không tìm thấy sản phẩm nào
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Hotline - Desktop Only */}
          <div className="hidden md:flex items-center">
            <Link href={`tel:${COMPANY_INFO.hotline}`} className="flex items-center hover:text-red-600">
              <div className="mr-2">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">HOTLINE:</div>
                <div className="text-lg font-bold text-black">{formatPhoneNumber(COMPANY_INFO.hotline)}</div>
              </div>
            </Link>
          </div>
          
          {/* User Account & Cart */}
          <div className="flex items-center space-x-5">
            {/* User Account Button */}
            <button 
              onClick={openProfile} 
              className="text-gray-700 hover:text-red-600 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            
            {/* Shopping Cart */}
            <button onClick={openCart} className="text-gray-700 hover:text-red-600 relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Spacer for sticky header */}
      {isSticky && <div className="h-20"></div>}
      
      {/* Main Navigation Section */}
      <div className="bg-gray-100 border-gray-200 hidden md:block">
        <div className="container bg-white my-2 mx-auto px-4 rounded-lg">
          <div className="flex items-center justify-between">
            {/* Categories Menu Button */}
            <div className="relative py-3 text-sm">
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
            
            {/* Main Navigation Links - Desktop Only */}
            <NavigationMenu.Root className="hidden md:flex">
              <NavigationMenu.List className="flex items-center space-x-1">
                {/* Home */}
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-red-600 text-sm font-medium">
                    <Link href="/">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      TRANG CHỦ
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>

                {/* Store */}
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 text-sm font-medium">
                    <Link href="/san-pham">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      CỬA HÀNG
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>

                {/* Guide */}
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 text-sm font-medium">
                    <Link href="#">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      HƯỚNG DẪN
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>

                {/* Policy */}
                <NavigationMenu.Item className="relative">
                  <NavigationMenu.Trigger className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    CHÍNH SÁCH
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="absolute left-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="relative">
                      <NavigationMenu.Link asChild className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Link href="/noi-dung/chinh-sach-bao-hanh-g3" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Chính sách bảo hành
                        </Link>
                      </NavigationMenu.Link>
                      <NavigationMenu.Link asChild className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Link href="/noi-dung/chinh-sach-doi-tra-g3" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Chính sách đổi trả
                        </Link>
                      </NavigationMenu.Link>
                      <NavigationMenu.Link asChild className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Link href="/noi-dung/chinh-sach-bao-mat-g3" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Chính sách bảo mật
                        </Link>
                      </NavigationMenu.Link>
                      <NavigationMenu.Link asChild className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Link href="/noi-dung/chinh-sach-thanh-toan-g3" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Chính sách thanh toán
                        </Link>
                      </NavigationMenu.Link>
                      <NavigationMenu.Link asChild className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Link href="/noi-dung/chinh-sach-kiem-hang-g3" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Chính sách kiểm hàng
                        </Link>
                      </NavigationMenu.Link>
                      <NavigationMenu.Link asChild className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Link href="/noi-dung/chinh-sach-van-chuyen-g3" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Chính sách vận chuyển
                        </Link>
                      </NavigationMenu.Link>
                    </div>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>

                {/* Contact */}
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 text-sm font-medium">
                    <Link href="/lien-he">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      LIÊN HỆ
                    </Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>

                {/* About */}
                <NavigationMenu.Item>
                  <NavigationMenu.Link asChild className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 text-sm font-medium">
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
            
            {/* Social Media Links - Desktop Only */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href={SOCIAL_LINKS[1].href} aria-label="Facebook" className="text-gray-600 hover:text-red-600" target="_blank" rel="noopener noreferrer">
              <Image src="/images/icon/facebook-round-color-icon.svg" alt="Facebook" width={20} height={20} className="h-5 w-5" />
              </Link>
            
              <Link href={SOCIAL_LINKS[2].href} aria-label="Tiktok" className="text-gray-600 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                <Image src="/images/icon/tiktok-circle.svg" alt="Tiktok" width={20} height={20} className="h-6 w-6" />   
              </Link>
             
              <Link href={SOCIAL_LINKS[3].href} aria-label="Youtube" className="text-gray-600 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                <Image src="/images/icon/youtube-music-icon.svg" alt="Tiktok" width={20} height={20} className="h-5 w-5" />   
              </Link>

              <Link href={SOCIAL_LINKS[0].href} aria-label="Shopee" className="text-gray-600 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                <Image src="/images/icon/shopee-icon.svg" alt="Shopee" width={20} height={20} className="h-5 w-5" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
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
                    <button onClick={() => {
                      closeProfile();
                      openProfile();
                    }} className="flex w-full items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      TÀI KHOẢN
                    </button>
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