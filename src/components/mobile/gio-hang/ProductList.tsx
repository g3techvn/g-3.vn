'use client';

import Image from 'next/image';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CartItem } from '@/types/cart';

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
                        src={item.image} 
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
                      <div className="text-red-600 font-medium">{item.price.toLocaleString()}đ</div>
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
          </div>
        )}
      </div>
    </>
  );
} 