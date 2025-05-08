'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@/utils/helpers';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/by-slug/${slug}`);
        
        if (!response.ok) {
          throw new Error(`Lỗi HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data.product);
      } catch (error: unknown) {
        console.error('Error fetching product details:', error);
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 w-2/3 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-8">
          Đã xảy ra lỗi: {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md mb-8">
          Không tìm thấy thông tin sản phẩm
        </div>
      </div>
    );
  }

  const hasDiscount = product.original_price && product.original_price > product.price;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
          {hasDiscount && product.discount_percentage && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-md">
              -{product.discount_percentage}%
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          <div className="text-sm text-gray-500 mb-4">
            Thương hiệu: {product.brand || product.brand_id}
          </div>

          <div className="flex items-center mb-6">
            {/* Rating stars */}
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={i < (product.rating || 5) ? "#FFD700" : "none"}
                stroke={i < (product.rating || 5) ? "#FFD700" : "currentColor"}
                className="h-5 w-5 text-gray-400 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
            <span className="text-sm text-gray-500 ml-2">({product.rating || 5})</span>
          </div>

          <div className="mb-6">
            {hasDiscount ? (
              <>
                <div className="text-gray-500 line-through text-lg">
                  {formatCurrency(product.original_price || 0)}
                </div>
                <div className="text-red-600 font-bold text-2xl">
                  {formatCurrency(product.price)}
                </div>
              </>
            ) : (
              <div className="text-red-600 font-bold text-2xl">
                {formatCurrency(product.price)}
              </div>
            )}
          </div>

          <div className="mb-6">
            <button className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-md text-lg w-full">
              Thêm vào giỏ hàng
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Mô tả sản phẩm</h2>
            <div className="text-gray-700">
              {product.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 