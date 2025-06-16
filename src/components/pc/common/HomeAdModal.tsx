'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdModal from '@/components/AdModal';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuth } from '@/features/auth/AuthProvider';

export default function HomeAdModal() {
  const isPC = useMediaQuery('(min-width: 1024px)');
  const { user } = useAuth();

  if (!isPC || user) {
    return null;
  }

  return (
    <AdModal expirationHours={12}>
      <div className="relative w-full" style={{ maxWidth: '1200px' }}>
        {/* Glass effect container */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-xl" />
        
        {/* Content with aspect ratio */}
        <div className="relative aspect-[3/2] p-6">
          <div className="absolute inset-0 p-6">
            <div className="w-full h-full bg-gradient-to-r from-white/80 to-white/50 backdrop-blur-md rounded-lg p-8 flex flex-col justify-center items-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ưu đãi đặc biệt!
              </h2>
              <p className="text-xl text-gray-700 mb-8 text-center max-w-2xl">
                Giảm giá lên đến 50% cho tất cả các sản phẩm trong tháng này.
                Đừng bỏ lỡ cơ hội!
              </p>
              <Link
                href="/uu-dai"
                className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors duration-300 hover:shadow-lg"
              >
                Xem ngay
              </Link>
            </div>
          </div>
          
          {/* Background image */}
          <Image
            src="/images/section-1.jpeg"
            alt="Background"
            fill
            className="object-cover rounded-xl -z-10"
            priority
          />
        </div>
      </div>
    </AdModal>
  );
} 