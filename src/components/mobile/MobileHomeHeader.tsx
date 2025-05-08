'use client'
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';

const MobileHomeHeader: React.FC = () => {
  const isVisible = useHeaderVisibility();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchVisible(false);
      }
    };

    if (isSearchVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchVisible]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý tìm kiếm ở đây
    console.log('Searching for:', searchText);
  };

  return (
    <div 
      className={`flex items-center justify-between px-4 py-2 bg-white sticky top-0 z-30 transition-transform duration-200 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2 transition-all duration-300 ${isSearchVisible ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
        <Image
          src="/images/logo-g3.png"
          alt="G3 Logo"
          width={240}
          height={24}
          className="h-6 w-auto object-contain"
          priority
        />
      </div>
      {/* Search bar */}
      <div 
        ref={searchRef}
        className={`flex-1 mx-2 transition-all duration-300 ${isSearchVisible ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}
      >
        <form onSubmit={handleSearch} className="bg-gray-100 rounded-full px-4 py-2 flex items-center">
          <svg 
            width="20" 
            height="20" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
            className="text-gray-500 mr-2 flex-shrink-0"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm sản phẩm"
            className="bg-transparent w-full text-sm text-gray-500 focus:outline-none"
          />
        </form>
      </div>
      {/* Icons */}
      <div className="flex items-center gap-3">
        <button 
          className={`text-gray-600 transition-all duration-300 ${isSearchVisible ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}
          onClick={toggleSearch}
        >
          <svg 
            width="24" 
            height="24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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