'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Drawer from 'antd/es/drawer'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Checkout from './checkout'
import ProductList from '@/components/features/cart/ProductList'

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
        maskClosable={true}
        zIndex={1000}
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
        <ProductList
          loading={false}
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
        />
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
