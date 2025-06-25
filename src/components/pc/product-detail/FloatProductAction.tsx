import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, ProductVariant } from '@/types';
import { CartItem } from '@/types/cart';
import { useCart } from '@/context/CartContext';
import { useBuyNow } from '@/context/BuyNowContext';
import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@/utils/helpers';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

export interface FloatProductActionProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export function FloatProductAction({ product, selectedVariant }: FloatProductActionProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { setBuyNowItem } = useBuyNow();
  const { showToast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      if (!selectedVariant && product.variants && product.variants.length > 0) {
        showToast('Vui lòng chọn phân loại sản phẩm!', 'destructive');
        return;
      }
      const cartItem: CartItem = {
        productId: product.id,
        quantity: 1,
        product: product
      };
      await addToCart(cartItem);
      showToast('Đã thêm vào giỏ hàng!', 'default');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Có lỗi xảy ra khi thêm vào giỏ hàng!', 'destructive');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant && product.variants && product.variants.length > 0) {
      showToast('Vui lòng chọn phân loại sản phẩm!', 'destructive');
      return;
    }
    const buyNowItem: CartItem = {
      productId: product.id,
      quantity: 1,
      product: product
    };
    setBuyNowItem(buyNowItem);
    router.push('/mua-ngay');
  };

  useEffect(() => {
    const SCROLL_THRESHOLD = 50; // px
    const SCROLL_SPEED_THRESHOLD = 200; // px per second

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastScrollTime.current;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);
      const scrollSpeed = (scrollDiff / timeDiff) * 1000;

      if (scrollSpeed > SCROLL_SPEED_THRESHOLD) {
        setIsVisible(currentScrollY <= lastScrollY.current);
      } else if (Math.abs(currentScrollY - lastScrollY.current) > SCROLL_THRESHOLD) {
        setIsVisible(currentScrollY <= lastScrollY.current);
      }

      lastScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 transform transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'} hidden md:block z-50`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={selectedVariant?.image_url || product.image_url || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <div className="text-xl font-bold text-red-600">{formatCurrency(selectedVariant?.price || product.price || 0)}</div>
                {(selectedVariant?.original_price || product.original_price) && (
                  <div className="text-sm text-gray-400 line-through">{formatCurrency(selectedVariant?.original_price || product.original_price || 0)}</div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="min-w-[180px]"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              Thêm vào giỏ
            </Button>
            <Button
              variant="default"
              size="lg"
              className="min-w-[180px] bg-red-600 hover:bg-red-700"
              onClick={handleBuyNow}
            >
              Mua ngay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 