import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductVariant } from '@/types';
import { CartItem } from '@/types/cart';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { ShoppingCartIcon, ChevronLeftIcon, EllipsisVerticalIcon, StarIcon, ShareIcon, CloudIcon, MinusCircleIcon, TrashIcon, ArrowPathIcon, ShieldCheckIcon, TruckIcon, WrenchScrewdriverIcon, XMarkIcon, ChevronRightIcon, PlayCircleIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import * as Dialog from '@radix-ui/react-dialog';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import * as DropdownMenu from '@radix-ui/react-dialog';
import Image from 'next/image';
import { Breadcrumb } from '@/components/pc/common/Breadcrumb';

interface Comment {
  id: string;
  user: {
    name: string;
  };
  rating: number;
  content: string;
  date: string;
  likes: number;
  publisherReply?: {
    name: string;
    date: string;
    content: string;
  };
}

// Hàm tạo màu ngẫu nhiên từ tên
const getRandomColor = (name: string) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

// Hàm lấy 2 ký tự đầu của tên
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Gallery item types
type GalleryVideo = {
  type: 'video';
  url: string;
  embed: string;
  thumbnail: string;
  title: string;
};
type GalleryImage = {
  type: 'image';
  src: string;
  alt: string;
};
type GalleryItem = GalleryVideo | GalleryImage;

export default function MobileProductDetail({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-1 -mr-1 rounded-full hover:bg-gray-100"
            >
              <EllipsisVerticalIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center gap-3 p-4">
          <button
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200"
            onClick={() => {
              if (!selectedVariant && product.variants && product.variants.length > 0) {
                showToast('Vui lòng chọn phân loại sản phẩm!', 'destructive');
                return;
              }
              const cartItem: CartItem = {
                productId: product.id,
                quantity: 1,
                product: {
                  ...product,
                  variants: selectedVariant ? [selectedVariant] : []
                }
              };
              addToCart(cartItem);
            }}
          >
            <ShoppingCartIcon className="w-6 h-6" />
            <span>Thêm vào giỏ hàng</span>
          </button>
        </div>
      </div>
    </div>
  );
}