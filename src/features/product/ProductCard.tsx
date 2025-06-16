import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/utils/helpers';
import { Product, Brand } from '@/types';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import OptimizedImage from '@/components/common/OptimizedImage';

interface ProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
  brands?: Brand[];
}

export function ProductCard({ product, index = 0, priority = false, brands = [] }: ProductCardProps) {
  const { id, name, price, image_url, original_price, discount_percentage, brand_id, brand, rating, slug } = product;
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [brandName, setBrandName] = useState<string>('');
  
  const hasDiscount = original_price && original_price > price;
  const displayRating = rating || Math.floor(Math.random() * 5) + 1;

  // Log when brands prop changes
  useEffect(() => {
    console.log(`ProductCard for ${name} received brands array with ${brands.length} items`);
  }, [brands, name]);

  // Find brand name from brands array using brand_id
  useEffect(() => {
    if (brand) {
      // If brand name already exists, use it
      setBrandName(brand);
    } else if (brand_id && brands.length > 0) {
      // Otherwise look up from brands array
      // Log for debugging
      console.log('Looking up brand_id:', brand_id, 'type:', typeof brand_id);
      console.log('Available brands sample:', brands.slice(0, 3).map(b => ({id: b.id, title: b.title, idType: typeof b.id})));
      
      // Normalize IDs for comparison - we've seen issues with string vs number comparisons
      const brandIdString = String(brand_id).trim();
      
      // Try matching by string comparison to avoid type issues
      const foundBrand = brands.find(b => String(b.id).trim() === brandIdString);
      
      if (foundBrand) {
        console.log('Found brand match:', foundBrand.title);
        setBrandName(foundBrand.title);
      } else {
        console.log('No brand match found for brand_id:', brand_id);
        // Try additional debugging to see format differences
        if (brands.length > 0) {
          console.log('First brand id:', String(brands[0].id), '(', typeof brands[0].id, ')');
          console.log('vs brand_id:', brandIdString, '(', typeof brand_id, ')');
        }
        setBrandName(brand_id);
      }
    } else {
      setBrandName('Unknown');
    }
  }, [brand, brand_id, brands]);

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1] as const
      }
    })
  } as const;

  return (
    <motion.div 
      className="group relative overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm card-hover"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
      layoutId={`product-${id}`}
    >
      <Link href={`/san-pham/${slug || id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden">
          {hasDiscount && discount_percentage && (
            <motion.div 
              className="absolute top-2 left-2 z-10 rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              -{discount_percentage}%
            </motion.div>
          )}
          <OptimizedImage
            src={image_url || '/placeholder-product.jpg'}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
            className="transition-transform duration-300 group-hover:scale-105"
            objectFit="cover"
          />
        </div>
        <div className="p-3">
          <div className="text-xs text-gray-500 mb-1">{brandName}</div>
          
          <h3 className="mb-1 text-sm font-medium text-gray-900 line-clamp-2 h-[2.5rem] group-hover:text-red-600 transition-colors duration-200">
            {name}
          </h3>
          
          {/* Rating stars */}
          <div className="flex items-center mb-1">
            {[...Array(5)].map((_, i) => (
              <motion.svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={i < displayRating ? "#FFD700" : "none"}
                stroke={i < displayRating ? "#FFD700" : "currentColor"}
                className="h-3 w-3 text-gray-400"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </motion.svg>
            ))}
          </div>
          
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <motion.span 
                  className="text-gray-500 line-through text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {formatCurrency(original_price)}
                </motion.span>
                <motion.span 
                  className="text-red-600 font-bold text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {formatCurrency(price)}
                </motion.span>
              </>
            ) : (
              <motion.span 
                className="text-red-600 font-bold text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {formatCurrency(price)}
              </motion.span>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute bottom-3 right-3">
        <motion.button
          className="rounded-full bg-red-600 p-2 text-white shadow-md hover:bg-red-700 transition-colors duration-200"
          aria-label="Add to cart"
          onClick={(e) => {
            e.preventDefault();
            const cartItem = {
              ...product,
              quantity: 1,
              image: product.image_url || ''
            };
            addToCart(cartItem);
          }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.6,
            type: "spring",
            stiffness: 500,
            damping: 15
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
} 