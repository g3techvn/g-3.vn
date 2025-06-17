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
      <div className="relative w-full">
        {/* Content with aspect ratio */}
        <div className="relative aspect-[3/2] overflow-hidden rounded-xl">
          {/* Background image */}
          <Image
            src="/images/section-1.jpeg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/50 backdrop-blur-md" />
          
          {/* Content */}
          <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ưu đãi đặc biệt!
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl">
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
      </div>
    </AdModal>
  );
} 