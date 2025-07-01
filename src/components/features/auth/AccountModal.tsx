import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/features/auth/AuthProvider';
import AuthModals from './AuthModals';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  if (!isOpen) return null;

  // Show auth modals if user is not logged in
  if (!user) {
    return (
      <AuthModals
        isLoginOpen={isLoginOpen || isOpen}
        isRegisterOpen={isRegisterOpen}
        onCloseLogin={() => {
          setIsLoginOpen(false);
          onClose();
        }}
        onCloseRegister={() => {
          setIsRegisterOpen(false);
          onClose();
        }}
        onOpenLogin={() => {
          setIsLoginOpen(true);
          setIsRegisterOpen(false);
        }}
        onOpenRegister={() => {
          setIsRegisterOpen(true);
          setIsLoginOpen(false);
        }}
      />
    );
  }

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm bg-black/30" />
        
        <Dialog.Content 
          className="fixed inset-0 flex items-center justify-center z-50 px-4 animate-fadeIn"
          onEscapeKeyDown={onClose}
        >
          <Dialog.Title className="sr-only">
            Tài khoản
          </Dialog.Title>
          
          <div 
            className="relative w-full max-w-sm rounded-xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100/80">
              <div className="w-6"></div>
              <div className="mx-auto">
                <Image
                  src="/images/logo-g3.svg"
                  alt="G3 Logo"
                  width={100}
                  height={28}
                  className="h-7 w-auto object-contain"
                />
              </div>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-gray-700 transition">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Dialog.Close>
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
                <h3 className="font-medium text-base">{user.fullName || 'G3 Tech'}</h3>
                <p className="text-gray-500 text-sm">{user.email || 'info@g-3.vn'}</p>
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
              className="overflow-y-auto max-h-80 glassmorphism-scrollbar" 
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
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="text-gray-700">Thông báo và ưu đãi</span>
              </a>
              
              <Link href="/tai-khoan" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80" onClick={onClose}>
                <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="text-gray-700">Tổng quan tài khoản</span>
              </Link>
              
              <Link href="/tai-khoan/thong-tin" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80" onClick={onClose}>
                <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-gray-700">Thông tin tài khoản</span>
              </Link>
              
              <Link href="/tai-khoan/don-hang" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80" onClick={onClose}>
                <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-gray-700">Đơn hàng của tôi</span>
              </Link>
              
              <Link href="/uu-dai" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80" onClick={onClose}>
                <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-gray-700">Ưu đãi & Voucher</span>
              </Link>
              
              <Link href="/lien-he" className="flex items-center px-4 py-3 hover:bg-white/50 transition" onClick={onClose}>
                <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">Liên hệ & Hỗ trợ</span>
              </Link>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 hover:bg-white/50 transition border-t border-gray-100/80"
              >
                <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="text-gray-700">Đăng xuất</span>
              </button>
            </div>
            
            <div className="px-4 py-3 flex justify-between text-sm text-gray-500 border-t border-gray-100/80">
              <a href="#" className="hover:text-gray-700 transition">Chính sách quyền riêng tư</a>
              <span className="px-2">•</span>
              <a href="#" className="hover:text-gray-700 transition">Điều khoản dịch vụ</a>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AccountModal; 