'use client';

import { useState, useEffect } from 'react';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  
  const shipping = 30000;
  const total = totalPrice + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHomeHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8 bg-white rounded-xl shadow-sm my-6">
        <div className="flex items-start justify-between border-b border-gray-200 pb-4">
          <h1 className="text-lg font-medium text-gray-900">Giỏ hàng</h1>
          <Link href="/" className="relative -m-2 p-2 text-gray-400 hover:text-gray-500">
            <span className="sr-only">Tiếp tục mua sắm</span>
            <XMarkIcon aria-hidden="true" className="size-6" />
          </Link>
        </div>

        <div className="mt-8">
          <div className="flow-root">
            {loading ? (
              <div className="py-6 text-center">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-block rounded-md border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-red-700"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            ) : (
              <ul role="list" className="-my-6 divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex py-6">
                    <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        width={100} 
                        height={100} 
                        className="size-full object-cover" 
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">{item.price.toLocaleString()}₫</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.brand || 'Không rõ'}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border rounded overflow-hidden">
                          <button 
                            type="button" 
                            className="px-2 py-1 border-r hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button 
                            type="button" 
                            className="px-2 py-1 border-l hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className="flex">
                          <button 
                            type="button" 
                            className="font-medium text-red-600 hover:text-red-500"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-6 mt-6">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
              <p>Tạm tính</p>
              <p>{totalPrice.toLocaleString()}₫</p>
            </div>
            <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
              <p>Phí vận chuyển</p>
              <p>{shipping.toLocaleString()}₫</p>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 mt-4">
              <p>Tổng tiền</p>
              <p>{total.toLocaleString()}₫</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">Đã bao gồm thuế VAT.</p>
            
            <div className="mt-6">
              <a
                href="#"
                className="flex items-center justify-center rounded-md border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-red-700"
              >
                Thanh toán
              </a>
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
              <p>
                hoặc{' '}
                <Link
                  href="/"
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Tiếp tục mua sắm
                  <span aria-hidden="true"> &rarr;</span>
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 