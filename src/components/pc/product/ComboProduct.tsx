'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { Card, CardBadge, CardContent, CardHeader } from '@/components/ui/Card';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Rating } from '@/components/ui/Rating';
import { Product, Brand } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/pc/product/ProductCard';
import { CartItem } from '@/types/cart';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/helpers';

export default function ComboProduct({ 
  products = [],
  brands = []
}: {
  products: Product[];
  brands?: Brand[];
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-6 uppercase">
          Combo sản phẩm
        </h2>

        {/* Layout with banner (4 cols) left and 2 products right */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          {/* Banner - takes 4 columns */}
          <div className="col-span-6 lg:col-span-4 relative h-[250px] lg:h-[400px] rounded-lg overflow-hidden">
            <Image 
              src="/images/header-img.jpg"
              alt="Combo Sản Phẩm"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center pl-6 md:pl-12">
              <h3 className="text-white text-lg md:text-2xl font-bold mb-1">Nội Thất Văn Phòng</h3>
              <p className="text-white/90 text-xs md:text-sm max-w-md lg:max-w-lg">
                Nâng tầm không gian làm việc với bộ sưu tập nội thất văn phòng cao cấp, thiết kế hiện đại và tiện nghi
              </p>
              <Link href="#" className="mt-3 inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors max-w-fit">
                Khám phá ngay
              </Link>
            </div>
          </div>

          {/* First 2 products - takes 1 column each */}
          {products.slice(0, 2).map((product) => (
            <div key={product.id} className="col-span-3 lg:col-span-1">
              <ProductCard 
                product={product}
              />
            </div>
          ))}
        </div>

        {/* Row 2 with remaining products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.slice(2).map((product) => (
            <div key={product.id}>
              <ProductCard 
                product={product}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 