'use client';

import React from 'react';
import { CartItem } from '@/types/cart';
import { formatCurrency } from '@/utils/helpers';
import Image from 'next/image';
import { X, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import ProductSelectionModal from './ProductSelectionModal';

interface ProductListProps {
  loading: boolean;
  cartItems: CartItem[];
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
}

export default function ProductList({
  loading,
  cartItems,
  removeFromCart,
  updateQuantity,
}: ProductListProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-2">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M4.5 3.75a3 3 0 013-3h9a3 3 0 013 3v.75H4.5v-.75z" fill="#DC2626" />
              <path d="M21.75 9.75H2.25V19.5a3 3 0 003 3h13.5a3 3 0 003-3V9.75z" fill="#DC2626" opacity="0.3" />
              <path d="M21.75 4.5H2.25v5.25h19.5V4.5z" fill="#DC2626" opacity="0.6" />
            </svg>
          </div>
          <span className="text-lg font-medium">Sản phẩm đặt mua</span>
        </div>
      </div>
      
      <div className="bg-white rounded-md">
        {cartItems.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex gap-4 py-4 border-b">
                <div className="relative w-20 h-20">
                  <Image
                    src={item.product.image_url || '/placeholder.png'}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{formatCurrency(item.product.price)}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Thêm sản phẩm
          </button>
        </div>
      </div>

      <ProductSelectionModal 
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
} 