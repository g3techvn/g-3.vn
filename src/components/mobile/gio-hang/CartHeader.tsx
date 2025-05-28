'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/features/auth/AuthProvider';
import { useState } from 'react';

interface CartHeaderProps {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  handlePreviewPDF: () => void;
  handleDownloadPDF: () => void;
}

export default function CartHeader({
  showMenu,
  setShowMenu,
  handlePreviewPDF,
  handleDownloadPDF
}: CartHeaderProps) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.error) {
      setShowUserMenu(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 p-3 flex items-center sticky top-0 z-10">
      <Link href="/" className="absolute left-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </Link>
      <div className="flex-1 flex justify-center">
        <h1 className="text-lg font-medium text-gray-800">Giỏ hàng</h1>
      </div>
      <div className="absolute right-3 flex items-center">
        {/* User Avatar with Context Menu */}
        <div className="relative mr-2">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="focus:outline-none"
          >
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
              <div className="w-8 h-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </button>

          {/* User Context Menu */}
          {showUserMenu && user && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="relative w-12 h-12 mr-3">
                    <Image 
                      src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
                      alt="avatar" 
                      fill
                      className="rounded-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </div>
              <div className="py-1">
                <Link
                  href="/tai-khoan"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Tài khoản của tôi
                  </div>
                </Link>
                <Link
                  href="/don-hang"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Đơn hàng của tôi
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                >
                  <div className="flex items-center text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Menu Button */}
        <button 
          className="p-2 text-gray-600"
          onClick={() => setShowMenu(!showMenu)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>
        {/* Context Menu */}
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <button
                onClick={handlePreviewPDF}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-b border-gray-100"
                role="menuitem"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Xem trước PDF
                </div>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Tải PDF
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 