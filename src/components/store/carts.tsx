'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Drawer } from 'antd'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Checkout from './checkout'

export default function ShoppingCart({ isOpen = false, onClose }: { isOpen: boolean; onClose: () => void }) {
  // Use context to get cart details
  const { cartItems, totalPrice, removeFromCart, updateQuantity } = useCart()
  
  // Control checkout drawer visibility
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  
  // Control whether cart is in editable mode
  const [editableMode, setEditableMode] = useState(true)

  // Ref to track if backdrop click handler should close both drawers
  const shouldCloseAll = useRef(true);

  // When checkout drawer is open, change backdrop click behavior
  useEffect(() => {
    shouldCloseAll.current = !isCheckoutOpen;
  }, [isCheckoutOpen]);

  const openCheckout = () => {
    // Disable backdrop's close-cart-only behavior
    shouldCloseAll.current = false;
    setEditableMode(false);
    setIsCheckoutOpen(true);
  }

  // Clear and specific closeCheckout function
  const closeCheckout = useCallback(() => {
    console.log("closeCheckout called from checkout component");
    
    // Directly update state without delays
    setIsCheckoutOpen(false);
    setEditableMode(true);
    shouldCloseAll.current = true;
    
    console.log("Cart drawer restored to editable mode");
  }, []);

  // Handle closing both drawers
  const handleCloseAll = () => {
    setIsCheckoutOpen(false);
    onClose();
  }
  
  // Custom title with right-aligned close button
  const CartTitle = editableMode ? (
    <div className="flex w-full justify-between items-center">
      <span>Giỏ hàng</span>
      <XMarkIcon 
        className="size-6 cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={onClose}
      />
    </div>
  ) : <span>Giỏ hàng</span>;

  return (
    <>
      <Drawer
        title={CartTitle}
        placement="right"
        onClose={onClose}
        open={isOpen}
        width={384}
        className="cart-drawer"
        closeIcon={null} // Hide default close icon
        mask={true}
        maskClosable={false}
        styles={{
          body: {
            paddingBottom: 80,
            overflow: 'auto'
          },
          header: {
            padding: '16px 24px'
          }
        }}
        footer={
          <div className="border-t border-gray-200 px-4 py-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Tổng tiền</p>
              <p>{totalPrice.toLocaleString()}₫</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">Phí vận chuyển và thuế sẽ được tính khi thanh toán.</p>
            <div className="mt-6">
              <button
                onClick={openCheckout}
                disabled={cartItems.length === 0 || isCheckoutOpen}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Thanh toán
              </button>
            </div>
            {editableMode && (
              <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                <p>
                  hoặc{' '}
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-medium text-red-600 hover:text-red-500"
                  >
                    Tiếp tục mua sắm
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            )}
          </div>
        }
      >
        {cartItems.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
          </div>
        ) : (
          <ul role="list" className="-my-6 divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li key={item.id} className="flex py-6">
                <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <Image 
                    src={item.image_url} 
                    alt={item.name} 
                    width={100} 
                    height={100} 
                    className="h-full w-full object-cover object-center"
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
                    {!editableMode ? (
                      <p className="text-gray-600">SL: {item.quantity}</p>
                    ) : (
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
                    )}

                    {editableMode && (
                      <div className="flex">
                        <button 
                          type="button" 
                          className="font-medium text-red-600 hover:text-red-500"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
      
      {/* The checkout drawer component */}
      {isOpen && (
        <Checkout 
          isOpen={isCheckoutOpen} 
          onClose={closeCheckout} 
          closeAll={handleCloseAll} 
        />
      )}
    </>
  )
}
