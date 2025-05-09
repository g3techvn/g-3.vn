'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'

export default function ShoppingCart({ isOpen = false, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cartItems, totalPrice, removeFromCart, updateQuantity } = useCart()

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
            >
              <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">Giỏ hàng</DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Đóng</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flow-root">
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
                </div>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Tổng tiền</p>
                    <p>{totalPrice.toLocaleString()}₫</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">Phí vận chuyển và thuế sẽ được tính khi thanh toán.</p>
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
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
