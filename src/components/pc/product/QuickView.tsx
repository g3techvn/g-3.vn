import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'

interface QuickViewProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export default function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity,
      image: product.image_url || ''
    }
    addToCart(cartItem)
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Đóng</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Hình ảnh sản phẩm */}
                  <div className="aspect-square w-full relative">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                      {product.name}
                    </Dialog.Title>
                    
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-2xl font-bold text-red-600">{product.price.toLocaleString()}₫</span>
                      {product.original_price && (
                        <span className="text-sm text-gray-400 line-through">{product.original_price.toLocaleString()}₫</span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Số lượng */}
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                          Số lượng
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-md bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            <span className="sr-only">Giảm</span>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="block w-16 rounded-md border-0 py-1.5 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                          />
                          <button
                            type="button"
                            className="rounded-md bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            <span className="sr-only">Tăng</span>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Mô tả ngắn */}
                      <div className="text-sm text-gray-600">
                        <h4 className="font-medium text-gray-900 mb-1">Mô tả</h4>
                        <p className="line-clamp-4">{product.description}</p>
                      </div>

                      {/* Nút thêm vào giỏ */}
                      <button
                        type="button"
                        className="w-full rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                        onClick={handleAddToCart}
                      >
                        Thêm vào giỏ hàng
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 