import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductVariant } from '@/types';
import { CartItem } from '@/types/cart';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// Import all components directly
import { ProductHeader } from './ProductHeader';
import { ProductGallery } from './ProductGallery';
import ProductPrice from './ProductPrice';
import { ProductInfo } from './ProductInfo';
import { ProductDescription } from './ProductDescription';
import { ProductPolicies } from './ProductPolicies';
import { ProductActions } from './ProductActions';
import { ProductCartSheet } from './ProductCartSheet';
import { ProductVariants } from './ProductVariants';
import { ProductReviews } from './ProductReviews';
import { TechnicalSpecs } from './TechnicalSpecs';
import { ProductFeatures } from './ProductFeatures';

export default function MobileShopeeProductDetail({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const handleAddToCart = () => {
    if (!selectedVariant && product.variants && product.variants.length > 0) {
      showToast('Vui lòng chọn phân loại sản phẩm!', 'destructive');
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      quantity: quantity,
      product: selectedVariant 
        ? { ...product, variants: [selectedVariant] }
        : product
    };
    
    addToCart(cartItem);
    showToast('Đã thêm sản phẩm vào giỏ hàng!');
  };

  // ... rest of the component code ...

  return (
    <div>
      {/* Product Variants */}
      <ProductVariants 
        variants={product.variants || []}
        selectedVariant={selectedVariant}
        onSelectVariant={setSelectedVariant}
      />
      {/* ... rest of JSX ... */}
    </div>
  );
} 