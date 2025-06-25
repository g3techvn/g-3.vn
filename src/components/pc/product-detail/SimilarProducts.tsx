import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { CartItem } from '@/types/cart';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/useToast';
import { motion, Variants } from 'framer-motion';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/helpers';
import { Card, CardBadge, CardContent, CardHeader } from '@/components/ui/Card';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Rating } from '@/components/ui/Rating';
import * as ScrollArea from '@radix-ui/react-scroll-area';

export interface SimilarProductsProps {
  products: Product[];
  loading: boolean;
}

export function SimilarProducts({ products, loading }: SimilarProductsProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
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
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Sản phẩm tương tự</h2>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-square mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-900">Sản phẩm tương tự</h2>
      <div className="grid grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            className="group relative"
          >
            <Link href={`/san-pham/${product.slug}`} className="block">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <Image
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <motion.button
                  className="absolute bottom-4 right-4 p-2 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={(e) => handleAddToCart(e, product)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                </motion.button>
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                {product.name}
              </h3>
              <div className="mt-2">
                <div className="text-lg font-bold text-red-600">
                  {formatCurrency(product.price)}
                </div>
                {product.original_price && product.original_price > product.price && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatCurrency(product.original_price)}
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 