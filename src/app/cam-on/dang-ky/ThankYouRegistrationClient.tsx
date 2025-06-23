'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ThankYouRegistrationClientProps {
  email?: string;
}

export default function ThankYouRegistrationClient({
  email,
}: ThankYouRegistrationClientProps) {
  const router = useRouter();

  // Confetti effect
  useEffect(() => {
    // Simple confetti animation
    const createConfetti = () => {
      const confetti = document.createElement('div');
      confetti.innerHTML = '🎉';
      confetti.className = 'fixed text-2xl pointer-events-none animate-bounce';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-50px';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    };

    // Create multiple confetti
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createConfetti(), i * 300);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <svg 
                className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <div>
            <Image
              src="/logo.svg"
              alt="G3 Logo"
              width={200}
              height={56}
              className="mx-auto h-12 sm:h-14 w-auto mb-4 sm:mb-6"
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              🎉 Đăng ký thành công!
            </h1>
            <div className="text-base sm:text-lg text-gray-600 space-y-2">
              <p>
                Chào mừng bạn đến với cộng đồng G3 Tech!
              </p>
              {email && (
                <p className="text-green-600 font-medium text-sm sm:text-base break-all">
                  📧 Email xác nhận đã được gửi đến: <span className="font-semibold">{email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="text-blue-600 text-xl sm:text-2xl mb-2 sm:mb-3">📋</div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Bước tiếp theo</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Kiểm tra email để xác nhận tài khoản và bắt đầu mua sắm ngay!
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="text-green-600 text-xl sm:text-2xl mb-2 sm:mb-3">🎁</div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Ưu đãi đặc biệt</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Thành viên mới được giảm <span className="font-semibold text-green-600">10%</span> cho đơn hàng đầu tiên!
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="text-purple-600 text-xl sm:text-2xl mb-2 sm:mb-3">💎</div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Điểm thưởng</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Tích lũy điểm với mỗi giao dịch và đổi quà hấp dẫn.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="text-orange-600 text-xl sm:text-2xl mb-2 sm:mb-3">📞</div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Hỗ trợ 24/7</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Hotline: <span className="font-semibold">1900-xxxx</span> luôn sẵn sàng hỗ trợ bạn.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mt-6 sm:mt-8">
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition font-medium text-sm sm:text-base"
            >
              🏠 Khám phá sản phẩm
            </Link>
            
            <Link
              href="/tai-khoan"
              className="bg-gray-100 text-gray-700 px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition font-medium text-sm sm:text-base"
            >
              👤 Quản lý tài khoản
            </Link>
          </div>

          {/* Social Links */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Theo dõi chúng tôi để nhận tin tức mới nhất:</p>
            <div className="flex justify-center space-x-6">
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-800 transition"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-pink-600 hover:text-pink-800 transition"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.346-1.24-.898-.75-1.391-1.988-1.391-3.328 0-1.297.49-2.448 1.24-3.346.75-.898 1.988-1.391 3.328-1.391 1.297 0 2.448.49 3.346 1.24.898.75 1.391 1.988 1.391 3.328 0 1.297-.49 2.448-1.24 3.346-.75.898-1.988 1.391-3.328 1.391zm7.718-1.297c-.598 0-1.091-.49-1.091-1.088 0-.598.49-1.091 1.088-1.091.598 0 1.091.49 1.091 1.088 0 .598-.49 1.091-1.088 1.091z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-red-600 hover:text-red-800 transition"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
          <p>Cảm ơn bạn đã tin tưởng và lựa chọn G3 Tech! 💙</p>
        </div>
      </div>
    </div>
  );
} 