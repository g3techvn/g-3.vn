'use client';

import React, { use } from 'react';
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import Image from 'next/image';
import { MobileProductDetail } from '@/components/mobile/MobileProductDetail';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 w-1/4 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-lg text-gray-600">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <MobileProductDetail product={product} />

      {/* Desktop View */}
      <div className="hidden md:block container mx-auto py-8">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Sản phẩm', href: '/san-pham' },
            { label: product.name }
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {product.brand && (
                <p className="text-lg text-gray-600 mt-2">Thương hiệu: {product.brand}</p>
              )}
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.original_price)}
                </span>
              )}
              {product.discount_percentage && (
                <span className="text-sm font-medium text-red-600">
                  -{product.discount_percentage}%
                </span>
              )}
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="flex gap-4">
              <button
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // TODO: Implement add to cart functionality
                  console.log('Add to cart:', product.id);
                }}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => {
                  // TODO: Implement buy now functionality
                  console.log('Buy now:', product.id);
                }}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 