import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useEffect, useRef, useState } from 'react';

interface FloatProductActionProps {
  product: Product;
}

export function FloatProductAction({ product }: FloatProductActionProps) {
  const { addToCart } = useCart();
  const [show, setShow] = useState(true);
  const lastScrollY = useRef(0);
  const lastTimestamp = useRef(Date.now());
  const SCROLL_SPEED_THRESHOLD = 200; // px per second

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity: 1,
      image: product.image_url || ''
    };
    addToCart(cartItem);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const now = Date.now();
      const deltaY = Math.abs(currentScrollY - lastScrollY.current);
      const deltaTime = now - lastTimestamp.current;
      const speed = deltaTime > 0 ? (deltaY / (deltaTime / 1000)) : 0; // px/sec

      if (speed > SCROLL_SPEED_THRESHOLD) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          // Scrolling down fast
          setShow(true);
        } else if (currentScrollY < lastScrollY.current) {
          // Scrolling up fast
          setShow(false);
        }
      }
      lastScrollY.current = currentScrollY;
      lastTimestamp.current = now;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed container mx-auto left-0 right-16 bottom-2 z-50 flex justify-center transition-all duration-300 ${show ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'} translate-x-16`}
      style={{ width: '100%' }}
    >
      <div className="container mx-auto bg-white border border-gray-200 shadow-lg py-2 rounded-md flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12">
            <Image
              src={product.image_url || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-contain"
              sizes="48px"
            />
          </div>
          <div>
            <div className="text-red-600 font-bold">
              {product.price.toLocaleString()}đ
            </div>
            {product.original_price && (
              <div className="text-gray-500 line-through text-sm">
                {product.original_price.toLocaleString()}đ
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddToCart}
            className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
          >
            Thêm vào giỏ
          </button>
          <button
            onClick={handleAddToCart}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
} 