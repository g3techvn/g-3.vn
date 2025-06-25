'use client'

import { useEffect, useState } from 'react';
import { CartItem } from '@/types/cart'
import { formatCurrency } from '@/utils/helpers'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface ProductListProps {
  items: CartItem[];
  loading?: boolean;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
  readOnly?: boolean;
}

export default function ProductList({ items, loading, onUpdateQuantity, onRemoveItem, readOnly = false }: ProductListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <div className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</div>
        <div className="text-sm text-gray-500">
          Hãy thêm sản phẩm vào giỏ hàng để tiếp tục
        </div>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-my-6 divide-y divide-gray-200">
        {items.map((item) => (
          <li key={item.productId} className="flex py-6">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
              <Image
                src={item.product.image_url || ''}
                alt={item.product.name}
                width={96}
                height={96}
                className="h-full w-full object-cover object-center"
              />
            </div>

            <div className="ml-4 flex flex-1 flex-col">
              <div>
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{formatCurrency(item.product.price)}</p>
                </div>
                {item.product.variants && item.product.variants.length > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    {`${item.product.variants[0].color || ''} ${item.product.variants[0].size || ''}`}
                  </p>
                )}
              </div>
              <div className="flex flex-1 items-end justify-between text-sm">
                {!readOnly ? (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-500">Số lượng</p>
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() => onUpdateQuantity?.(item.productId, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-2 py-1">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity?.(item.productId, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Số lượng: {item.quantity}</p>
                )}

                {!readOnly && (
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => onRemoveItem?.(item.productId)}
                      className="font-medium text-red-600 hover:text-red-500"
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
    </div>
  )
} 