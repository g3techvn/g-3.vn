'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Product, Category, Brand } from '@/types';
import { formatCurrency } from '@/utils/helpers';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  useEffect(() => {
    if (!id) {
      router.push('/products');
      return;
    }

    async function fetchProductDetails() {
      try {
        setLoading(true);
        
        // Lấy thông tin sản phẩm từ API route
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Không tìm thấy sản phẩm');
          }
          throw new Error(`Lỗi HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        setProduct(data.product);
        setCategory(data.category);
        setBrand(data.brand);
      } catch (error: unknown) {
        console.error('Error fetching product details:', error);
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [id, router]);

  const handleAddToCart = () => {
    // Chức năng này sẽ được triển khai sau
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="h-96 w-full rounded-lg bg-gray-200"></div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-200"></div>
              <div className="h-6 w-1/4 rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-10 w-1/3 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          <h2 className="text-lg font-medium">Lỗi</h2>
          <p>{error || 'Không tìm thấy sản phẩm'}</p>
          <button 
            onClick={() => router.push('/products')}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Quay lại trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-600 hover:text-primary"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="mr-1 h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative h-96 w-full overflow-hidden rounded-lg border border-gray-200">
          <Image
            src={product.image_url || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>

        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.name}</h1>
          
          <div className="mb-4 flex items-center">
            {category && (
              <span className="mr-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {category.name}
              </span>
            )}
            {brand && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                {brand.name}
              </span>
            )}
          </div>
          
          <p className="mb-4 text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
          
          <div className="mb-6 prose max-w-none text-gray-700">
            <p>{product.description}</p>
          </div>
          
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Số lượng
            </label>
            <div className="flex h-10 w-32 overflow-hidden rounded-md border border-gray-300">
              <button
                type="button"
                className="flex w-10 items-center justify-center border-r border-gray-300 bg-gray-100 hover:bg-gray-200"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border-0 px-3 py-2 text-center focus:outline-none"
              />
              <button
                type="button"
                className="flex w-10 items-center justify-center border-l border-gray-300 bg-gray-100 hover:bg-gray-200"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="mr-2 h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
              />
            </svg>
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
} 