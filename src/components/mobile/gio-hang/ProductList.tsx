'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { Product } from '@/types';
import { useCart, CartItem } from '@/context/CartContext';

interface ProductListProps {
  loading: boolean;
  cartItems: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

export default function ProductList({
  loading,
  cartItems,
  removeFromCart,
  updateQuantity
}: ProductListProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { addToCart } = useCart();

  // Fetch products for the drawer
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch products when drawer opens
  useEffect(() => {
    if (isDrawerOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isDrawerOpen, products.length]);

  return (
    <>
      <div className="flex items-center mb-3 mt-4">
        <div className="w-8 h-8 mr-2">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M4.5 3.75a3 3 0 013-3h9a3 3 0 013 3v.75H4.5v-.75z" fill="#DC2626" />
            <path d="M21.75 9.75H2.25V19.5a3 3 0 003 3h13.5a3 3 0 003-3V9.75z" fill="#DC2626" opacity="0.3" />
            <path d="M21.75 4.5H2.25v5.25h19.5V4.5z" fill="#DC2626" opacity="0.6" />
          </svg>
        </div>
        <span className="text-lg font-medium">Sản phẩm đặt mua</span>
      </div>
      
      <div className="bg-white p-4 rounded-md">
        {loading ? (
          <div className="py-3 flex items-center">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800 animate-spin">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="py-3 flex items-center">
            <div className="flex-shrink-0 mr-3">
              
            </div>
            <div className="flex-1">
              <div className="text-center text-gray-500">Giỏ hàng của bạn đang trống</div>
              <div className="mt-3 flex justify-center">
                <Link
                  href="/"
                  className="inline-block rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-red-700"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {cartItems.map((item, index) => (
              <div key={item.id}>
                <div className="py-3 flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-14 h-14 rounded-md overflow-hidden">
                      <Image 
                        src={item.image_url} 
                        alt={item.name} 
                        width={56} 
                        height={56} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <div className="text-gray-500 text-xs line-through">
                            {item.originalPrice.toLocaleString()}đ
                          </div>
                        )}
                        <div className="text-red-600 font-medium">{item.price.toLocaleString()}đ</div>
                      </div>
                      <div className="flex items-center">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-l text-sm"
                        >
                          -
                        </button>
                        <div className="w-8 h-6 flex items-center justify-center border-t border-b border-gray-300 text-sm">
                          {item.quantity}
                        </div>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded-r text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="flex-shrink-0 ml-3"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                {index < cartItems.length - 1 && <div className="border-t border-gray-100 my-2"></div>}
              </div>
            ))}

            {/* Add More Products Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-full mt-4 py-3 flex items-center justify-center text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Thêm sản phẩm
            </button>
          </div>
        )}
      </div>

      {/* Product Selection Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle>Chọn thêm sản phẩm</SheetTitle>
          </SheetHeader>
          <div className="mt-4 flex-1 overflow-auto">
            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4">
              {loadingProducts ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-2 animate-pulse">
                    <div className="relative aspect-square mb-2 bg-gray-200 rounded-md" />
                    <div className="h-4 bg-gray-200 rounded mb-1" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                ))
              ) : (
                // Actual products
                products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-2">
                    <div className="relative aspect-square mb-2">
                      <Image
                        src={product.image_url || 'https://via.placeholder.com/200'}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</h3>
                    <div className="mt-1">
                      {product.original_price && product.original_price > product.price && (
                        <div className="text-gray-500 text-xs line-through">
                          {product.original_price.toLocaleString()}đ
                        </div>
                      )}
                      <div className="text-red-600 font-medium text-sm">{product.price.toLocaleString()}đ</div>
                    </div>
                    <button 
                      onClick={() => {
                        addToCart(product);
                        setIsDrawerOpen(false);
                      }}
                      className="mt-2 w-full py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 