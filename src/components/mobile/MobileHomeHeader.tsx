'use client'
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';
import { createPortal } from 'react-dom';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';

const AccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      {/* Backdrop overlay with glass effect */}
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30" onClick={onClose} />
      
      <div 
        ref={modalRef} 
        className="relative w-full max-w-sm rounded-xl overflow-hidden animate-fadeIn"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100/80">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mx-auto">
            <Image
              src="/images/logo-g3.svg"
              alt="G3 Logo"
              width={100}
              height={28}
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="w-6"></div>
        </div>
        
        <div className="p-4 flex items-center border-b border-gray-100/80">
          <div className="relative w-12 h-12 mr-3">
            <Image 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
              alt="avatar" 
              fill
              className="rounded-full object-cover shadow-md" 
            />
            <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full border border-gray-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path d="M9 22V12h6v10" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-base">G3 Tech</h3>
            <p className="text-gray-500 text-sm">info@g-3.vn</p>
          </div>
          <button className="text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <button className="w-full border-b border-gray-100/80 px-4 py-3 flex justify-center text-gray-700 font-medium hover:bg-white/50 transition">
          Tài khoản Google
        </button>
        
        <div 
          className="overflow-y-auto max-h-80" 
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
          }}
        >
          <style jsx global>{`
            .glassmorphism-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .glassmorphism-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .glassmorphism-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(156, 163, 175, 0.3);
              border-radius: 20px;
              border: transparent;
            }
          `}</style>
          
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80">
            <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </div>
            <span className="text-gray-700">Quản lý ứng dụng và thiết bị</span>
          </a>
          
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80">
            <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="text-gray-700">Thông báo và ưu đãi</span>
          </a>
          
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80">
            <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-gray-700">Thanh toán và gói thuê bao</span>
          </a>
          
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80">
            <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-gray-700">Play Protect</span>
          </a>
          
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80">
            <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <span className="text-gray-700">Thư viện</span>
          </a>
          
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80">
            <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 12H4M20 12a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2M20 12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2" />
              </svg>
            </div>
            <span className="text-gray-700">Play Pass</span>
          </a>
          
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80">
            <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-gray-700">Chế độ cá nhân hoá trong Play</span>
          </a>
          
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80">
            <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-gray-700">Cài đặt</span>
          </a>
          
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition">
            <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-gray-700">Trợ giúp và phản hồi</span>
          </a>
        </div>
        
        <div className="px-4 py-3 flex justify-between text-sm text-gray-500 border-t border-gray-100/80">
          <a href="#" className="hover:text-gray-700 transition">Chính sách quyền riêng tư</a>
          <span className="px-2">•</span>
          <a href="#" className="hover:text-gray-700 transition">Điều khoản dịch vụ</a>
        </div>
      </div>
    </div>,
    document.body
  );
};

const MobileHomeHeader: React.FC = () => {
  const isVisible = useHeaderVisibility();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openCart, totalItems } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const toggleAccountModal = () => {
    setIsAccountModalOpen(!isAccountModalOpen);
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
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .glassmorphism-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .glassmorphism-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .glassmorphism-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
          border: transparent;
        }
      `}</style>
      
      <div 
        className={`flex items-center justify-between px-4 py-2 bg-white sticky top-0 z-30 transition-transform duration-200 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-2 transition-all duration-300 ${isSearchVisible ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <Image
            src="/images/logo-g3.svg"
            alt="G3 Logo"
            width={100}
            height={28}
            className="h-7 w-auto object-contain"
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
          <button onClick={toggleAccountModal} className="ml-1">
            {user ? (
              <div className="relative w-8 h-8">
                <Image 
                  src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
                  alt="avatar" 
                  fill
                  className="rounded-full object-cover" 
                />
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Account Modal with Portal */}
      {typeof window !== 'undefined' && (
        <AccountModal isOpen={isAccountModalOpen} onClose={toggleAccountModal} />
      )}
    </>
  );
};

export default MobileHomeHeader; 