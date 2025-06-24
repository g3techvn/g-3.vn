'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { useCart } from '@/features/cart/useCart';
import { formatCurrency } from '@/utils/helpers';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { CartItem } from '@/types/cart';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { cart, updateQuantity, removeFromCart, totalPrice, error } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/gio-hang');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Giỏ hàng của bạn
          </SheetTitle>
        </SheetHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="mt-8">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Giỏ hàng trống</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item) => (
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

              <div className="mt-8 space-y-4">
                <div className="flex justify-between text-lg font-medium">
                  <span>Tổng tiền:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>

                <Button onClick={handleCheckout} className="w-full">
                  Thanh toán
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer; 