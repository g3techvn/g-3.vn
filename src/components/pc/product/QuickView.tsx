import { Fragment, useState, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { Product, ProductVariant } from '@/types'
import { useCart } from '@/context/CartContext'
import { ProductVariants } from '../product-detail/ProductVariants'

interface QuickViewProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export default function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  // State để quản lý biến thể đã chọn
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    // Chọn biến thể mặc định hoặc biến thể đầu tiên nếu có
    if (product.variants && product.variants.length > 0) {
      return product.variants.find(v => v.is_default) || product.variants[0]
    }
    return null
  })

  // Tính toán giá và thông tin hiển thị dựa trên biến thể đã chọn
  const displayInfo = useMemo(() => {
    if (selectedVariant) {
      return {
        price: selectedVariant.price,
        originalPrice: selectedVariant.original_price,
        imageUrl: selectedVariant.image_url || product.image_url || '/placeholder-product.jpg',
        inStock: selectedVariant.stock_quantity > 0
      }
    }
    return {
      price: product.price,
      originalPrice: product.original_price,
      imageUrl: product.image_url || '/placeholder-product.jpg',
      inStock: true
    }
  }, [selectedVariant, product])

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      price: displayInfo.price,
      original_price: displayInfo.originalPrice,
      quantity,
      image: displayInfo.imageUrl,
      variant: selectedVariant || undefined
    }
    addToCart(cartItem)
    onClose()
  }

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant)
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
                      src={displayInfo.imageUrl}
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
                      <span className="text-2xl font-bold text-red-600">{displayInfo.price.toLocaleString()}₫</span>
                      {displayInfo.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">{displayInfo.originalPrice.toLocaleString()}₫</span>
                      )}
                    </div>

                    {/* Biến thể sản phẩm */}
                    {product.variants && product.variants.length > 1 && (
                      <div className="mb-4">
                        <ProductVariants
                          variants={product.variants}
                          selectedVariant={selectedVariant}
                          onSelectVariant={handleVariantSelect}
                        />
                      </div>
                    )}

                    {/* Thông báo tình trạng kho */}
                    {!displayInfo.inStock && (
                      <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">Sản phẩm này hiện đang hết hàng</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Số lượng */}
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                          Số lượng
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-md bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={!displayInfo.inStock}
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
                            max={selectedVariant?.stock_quantity || 999}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            disabled={!displayInfo.inStock}
                            className="block w-16 rounded-md border-0 py-1.5 text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 disabled:opacity-50"
                          />
                          <button
                            type="button"
                            className="rounded-md bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={!displayInfo.inStock}
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
                        className="w-full rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleAddToCart}
                        disabled={!displayInfo.inStock}
                      >
                        {displayInfo.inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
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