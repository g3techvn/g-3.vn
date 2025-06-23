import React, { useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        onClose();
        router.push('/gio-hang');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/gio-hang`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google login failed:', error);
      setError('Đã xảy ra lỗi khi đăng nhập với Google');
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/gio-hang`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Facebook login failed:', error);
      setError('Đã xảy ra lỗi khi đăng nhập với Facebook');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm bg-black/30" />
        
        <Dialog.Content 
          className="fixed inset-0 flex items-center justify-center z-50 px-4 animate-fadeIn"
          onEscapeKeyDown={onClose}
        >
          <Dialog.Title className="sr-only">
            Đăng nhập
          </Dialog.Title>
          
          <div 
            className="relative w-full max-w-sm rounded-xl overflow-hidden bg-white"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
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

            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Đăng nhập
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <a href="#" className="text-sm text-red-600 hover:text-red-800">
                    Quên mật khẩu?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-50"
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Hoặc đăng nhập với
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c2.17 0 4.1.78 5.63 2.07l4.2-4.2C19.37 0.97 15.97 0 12 0 7.38 0 3.39 2.25 1.33 5.77l4.85 3.76C7.33 6.83 9.28 5.04 12 5.04z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.54 12.27c0-.95-.08-1.86-.24-2.73H12v5.17h6.44c-.28 1.46-1.12 2.7-2.38 3.53v2.94h3.86c2.26-2.08 3.56-5.14 3.56-8.91z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.07 7.92-2.9l-3.86-2.94c-1.07.72-2.44 1.14-4.06 1.14-3.12 0-5.76-2.11-6.7-4.94l-3.99 3.08C3.32 21.27 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.3 14.36c-.24-.72-.38-1.5-.38-2.29 0-.79.14-1.57.38-2.29V6.7H1.31C.47 8.29 0 10.09 0 12c0 1.91.47 3.71 1.31 5.3l3.99-3.08z"
                      />
                    </svg>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Google
                    </span>
                  </button>

                  <button 
                    type="button"
                    onClick={handleFacebookLogin}
                    className="flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Facebook
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LoginModal; 