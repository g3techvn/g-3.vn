import React from 'react';
import Image from 'next/image';
import { Product, ProductVariant, CartItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/utils/helpers';

export interface FloatProductActionProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export function FloatProductAction({ product, selectedVariant }: FloatProductActionProps) {
  const { addToCart } = useCart();
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(Date.now());
  const SCROLL_SPEED_THRESHOLD = 200; // px per second
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      const cartItem: CartItem = {
        id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
        name: product.name,
        price: selectedVariant?.price || product.price,
        original_price: selectedVariant?.original_price || product.original_price,
        quantity: 1,
        image: selectedVariant?.image_url || product.image_url || '',
        variant: selectedVariant || undefined
      };
      await addToCart(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTimestamp = Date.now();
      const timeDiff = currentTimestamp - lastTimestamp.current;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);
      const scrollSpeed = (scrollDiff / timeDiff) * 1000;

      if (scrollSpeed > SCROLL_SPEED_THRESHOLD) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          // Scrolling down fast
          setShow(false);
        } else if (currentScrollY < lastScrollY.current) {
          // Scrolling up fast
          setShow(true);
        }
      }

      lastScrollY.current = currentScrollY;
      lastTimestamp.current = currentTimestamp;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentPrice = selectedVariant?.price || product.price;
  const originalPrice = selectedVariant?.original_price || product.original_price;

  return (
    <div
      className={`fixed container mx-auto left-0 right-16 bottom-2 z-50 flex justify-center transition-all duration-300 ${show ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'} translate-x-16`}
      style={{ width: '100%' }}
    >
      <div className="container mx-auto bg-white/30 backdrop-blur-md border border-gray-200 shadow-lg py-2 rounded-md flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12">
            <Image
              src={selectedVariant?.image_url || product.image_url || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-contain"
              sizes="48px"
            />
          </div>
          <div>
            <div className="text-red-600 font-bold">
              {formatCurrency(currentPrice)}
            </div>
            {originalPrice && originalPrice > currentPrice && (
              <div className="text-gray-500 line-through text-sm">
                {formatCurrency(originalPrice)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 text-center px-4">
          <div className="font-medium text-gray-900 line-clamp-1">
            {product.name}
            {selectedVariant && ` - ${selectedVariant.color}`}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
} 