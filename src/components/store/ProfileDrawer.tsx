'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/features/auth/AuthProvider'
import Image from 'next/image'
import Link from 'next/link'

type View = 'login' | 'register' | 'profile';

export default function ProfileDrawer({ isOpen = false, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('login')
  
  // Reset form when drawer closes
  const handleClose = () => {
    setTimeout(() => {
      setError(null);
      setView(user ? 'profile' : 'login');
    }, 300);
    onClose();
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    
    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error.message)
    } else {
      setView('profile');
      onClose();
    }
  }
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!email || !password || !fullName) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp')
      return
    }
    
    const result = await signUp(email, password, fullName)
    if (result.error) {
      setError(result.error.message)
    } else {
      setView('profile');
      onClose();
    }
  }
  
  const handleSignOut = async () => {
    await signOut();
    setView('login');
  }

  const renderForm = () => {
    if (loading) {
      return (
        <div className="py-6 text-center">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      );
    }

    if (user) {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center">
              {user.avatar ? (
                <Image 
                  src={user.avatar} 
                  alt={user.fullName} 
                  width={64} 
                  height={64} 
                  className="size-full object-cover" 
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user.fullName}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-base font-medium text-gray-900 mb-3">Quản lý tài khoản</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/account" 
                  className="flex items-center text-gray-700 hover:text-red-600"
                  onClick={handleClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin tài khoản
                </Link>
              </li>
              <li>
                <Link 
                  href="/orders" 
                  className="flex items-center text-gray-700 hover:text-red-600"
                  onClick={handleClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Đơn hàng của tôi
                </Link>
              </li>
              <li>
                <Link 
                  href="/wishlist" 
                  className="flex items-center text-gray-700 hover:text-red-600"
                  onClick={handleClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Sản phẩm yêu thích
                </Link>
              </li>
              <li>
                <Link 
                  href="/address" 
                  className="flex items-center text-gray-700 hover:text-red-600"
                  onClick={handleClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Sổ địa chỉ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      );
    }

    if (view === 'login') {
      return (
        <div className="py-4">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Nhập email của bạn"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Nhập mật khẩu của bạn"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="text-red-600 hover:text-red-500" onClick={handleClose}>
                  Quên mật khẩu?
                </Link>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Đăng nhập
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <button
                onClick={() => setView('register')}
                className="text-red-600 hover:text-red-500 font-medium"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="py-4">
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập họ và tên của bạn"
            />
          </div>
          <div>
            <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="registerEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập email của bạn"
            />
          </div>
          <div>
            <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              id="registerPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập mật khẩu của bạn"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nhập lại mật khẩu của bạn"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Đăng ký
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button
              onClick={() => setView('login')}
              className="text-red-600 hover:text-red-500 font-medium"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-white-500/75 transition-opacity duration-300 ease-in-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out data-closed:translate-x-full"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white/30 backdrop-blur-md dark:bg-gray-900/50 shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                      {user 
                        ? 'Thông tin tài khoản' 
                        : view === 'login' 
                          ? 'Đăng nhập' 
                          : 'Đăng ký'
                      }
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Đóng</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flow-root">
                      {renderForm()}
                    </div>
                  </div>
                </div>

                {user && (
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
} 