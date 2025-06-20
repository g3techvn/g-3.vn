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
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-20 right-10 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute bottom-10 left-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
          </div>
          
          {/* Main content */}
          <div className="relative p-12 h-full flex flex-col justify-center items-center text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black text-sm font-bold rounded-full mb-6 shadow-lg">
              <span className="mr-2">⚡</span>
              ƯU ĐÃI GIỚI HẠN
            </div>
            
            {/* Main heading */}
            <h1 className="text-5xl font-black mb-4 leading-tight">
              VOUCHER
              <span className="block text-6xl text-yellow-300 drop-shadow-lg">
                200.000₫
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl font-medium mb-8 opacity-90 max-w-2xl leading-relaxed">
              Áp dụng cho đơn hàng từ <span className="font-bold text-yellow-300">500.000₫</span><br/>
              Số lượng có hạn - Nhanh tay đặt hàng!
            </p>
            
            {/* Voucher code section */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/30">
              <p className="text-sm font-medium mb-2 opacity-80">Mã voucher:</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-mono font-bold tracking-wider bg-white text-indigo-600 px-4 py-2 rounded-lg">
                  G3VIP200
                </span>
                <button className="text-yellow-300 hover:text-yellow-200 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex gap-4">
              <Link
                href="/uu-dai"
                className="inline-flex items-center bg-yellow-400 text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-yellow-300 transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <span className="mr-2">🎁</span>
                Nhận voucher ngay
              </Link>
              <Link
                href="/san-pham"
                className="inline-flex items-center bg-white/20 text-white border-2 border-white/50 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
              >
                Mua sắm ngay
              </Link>
            </div>
            
            {/* Timer or expiry info */}
            <div className="mt-6 flex items-center text-sm opacity-75">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ưu đãi có hiệu lực đến hết tháng này
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4">
            <div className="w-16 h-16 border-4 border-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
          </div>
        </div>
      </div>
    </AdModal>
  );
} 