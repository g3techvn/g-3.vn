import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Card, CardBadge, CardContent, CardHeader } from '@/components/ui/Card';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Rating } from '@/components/ui/Rating';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { motion } from 'framer-motion';

interface SimilarProductsProps {
  products: Product[];
  loading: boolean;
}

export function SimilarProducts({ products, loading }: SimilarProductsProps) {
  const { addToCart } = useCart();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <motion.div 
      className="mt-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <motion.h2 
        className="text-2xl font-bold text-gray-900 mb-6"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Sản phẩm tương tự
      </motion.h2>
      
      <ScrollArea.Root className="w-full overflow-hidden">
        <ScrollArea.Viewport className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading ? (
              // Loading skeleton with animations
              [...Array(5)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="animate-pulse"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <div className="aspect-square w-full rounded-lg bg-gray-200" />
                  <div className="mt-2 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                </motion.div>
              ))
            ) : products.length > 0 ? (
              products.map((product, idx) => (
                <motion.div 
                  key={product.id} 
                  className="relative"
                  variants={itemVariants}
                >
                  <Link href={`/san-pham/${product.slug || product.id}`}>
                    <motion.div
                      whileHover={{ 
                        y: -8,
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Card className="h-full relative overflow-hidden">
                        <CardHeader>
                          {product.discount_percentage && product.discount_percentage > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ 
                                type: "spring",
                                stiffness: 500,
                                damping: 15,
                                delay: 0.2 + idx * 0.05
                              }}
                            >
                              <CardBadge>-{product.discount_percentage}%</CardBadge>
                            </motion.div>
                          )}
                          <AspectRatio ratio={1 / 1}>
                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center overflow-hidden">
                              {product.image_url ? (
                                <motion.div
                                  className="w-full h-full"
                                  whileHover={{ scale: 1.05 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    width={300}
                                    height={300}
                                    className="w-full h-auto object-cover transition-all"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />
                                </motion.div>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </div>
                          </AspectRatio>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="text-xs text-gray-500 mb-1">{product.brand || 'Không rõ'}</div>
                          
                          <h3 className="text-xs font-medium mb-2 text-gray-800 group-hover:text-red-600 line-clamp-2 h-[2.5rem]">
                            {product.name}
                          </h3>
                          
                          <Rating value={product.rating || 4} className="mb-2" />
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              {product.original_price ? (
                                <>
                                  <span className="text-gray-500 line-through text-xs">
                                    {product.original_price.toLocaleString()}₫
                                  </span>
                                  <motion.span 
                                    className="text-red-600 font-bold text-sm block"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.05 }}
                                  >
                                    {product.price.toLocaleString()}₫
                                  </motion.span>
                                </>
                              ) : (
                                <motion.span 
                                  className="text-red-600 font-bold text-sm"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.3 + idx * 0.05 }}
                                >
                                  {product.price.toLocaleString()}₫
                                </motion.span>
                              )}
                            </div>
                            <motion.button 
                              className="p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors duration-200"
                              aria-label="Thêm vào giỏ hàng"
                              onClick={(e) => {
                                e.preventDefault();
                                const cartItem = {
                                  ...product,
                                  quantity: 1,
                                  image: product.image_url || ''
                                };
                                addToCart(cartItem);
                              }}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </motion.button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="col-span-full rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-base text-gray-600">Không tìm thấy sản phẩm tương tự.</p>
              </motion.div>
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar 
          className="flex h-2.5 touch-none select-none bg-gray-100 p-[1px] transition-colors duration-150 ease-out hover:bg-gray-200 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
          orientation="horizontal"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-full bg-gray-400" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </motion.div>
  );
} 