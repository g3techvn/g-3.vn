import React from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/features/auth/AuthProvider';
import LoginModal from './LoginModal';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();

  if (!isOpen) return null;

  // Show login modal if user is not logged in
  if (!user) {
    return <LoginModal isOpen={isOpen} onClose={onClose} />;
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
                  src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
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
              
              <a href="#" className="flex items-center px-4 py-3 hover:bg-white/50 transition border-b border-gray-100/80">
                <div className="w-6 h-6 mr-4 flex-shrink-0 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-gray-700">Thanh toán và đơn hàng</span>
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