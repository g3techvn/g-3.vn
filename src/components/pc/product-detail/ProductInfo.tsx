import React, { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { ArrowPathIcon, ShieldCheckIcon, TruckIcon, WrenchScrewdriverIcon, ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = () => {
    if (!isAddingToCart) {
      setIsAddingToCart(true);
      addToCart(product);
      
      // Show success message after adding to cart
      setTimeout(() => {
        setIsAddingToCart(false);
        setShowSuccess(true);
        
        // Hide success message after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      }, 800);
    }
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6 sticky top-20 self-start"
      initial="hidden"
      animate="visible"
      variants={staggerChildren}
    >
      <motion.div variants={fadeIn}>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        {product.brand && (
          <p className="text-lg text-gray-600 mt-2">Thương hiệu: {product.brand}</p>
        )}
      </motion.div>

      <motion.div 
        className="flex items-baseline gap-4"
        variants={fadeIn}
      >
        <span className="text-3xl font-bold text-gray-900">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(product.price)}
        </span>
        {product.original_price && product.original_price > product.price && (
          <span className="text-lg text-gray-500 line-through">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(product.original_price)}
          </span>
        )}
        {product.discount_percentage && (
          <motion.span 
            className="text-sm font-medium text-red-600"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: 2, repeatType: "reverse" }}
          >
            -{product.discount_percentage}%
          </motion.span>
        )}
      </motion.div>

      <motion.div 
        className="flex gap-4 relative"
        variants={fadeIn}
      >
        <motion.button
          className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // TODO: Implement buy now functionality
          }}
        >
          <CheckIcon className="h-5 w-5" />
          Mua ngay
        </motion.button>
        <motion.button
          className="flex-1 bg-red-100 text-red-800 px-6 py-3 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <ShoppingCartIcon className="h-5 w-5" />
          )}
          Thêm vào giỏ hàng
        </motion.button>
        
        {/* Success notification */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              className="absolute -top-12 left-0 right-0 bg-green-100 text-green-800 rounded-lg p-2 text-center font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              ✓ Đã thêm vào giỏ hàng
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Policy Section */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm p-6"
        variants={fadeIn}
        whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)" }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-red-700">Chính sách mua hàng tại G3-TECH</h2>
        <motion.div 
          className="space-y-4"
          variants={staggerChildren}
        >
          <motion.div 
            className="flex items-start gap-3"
            variants={fadeIn}
            whileHover={{ x: 3 }}
          >
            <ArrowPathIcon className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">1 đổi 1 chi tiết lỗi trong 15 ngày</span>
              <div className="text-xs text-gray-500">nếu lỗi do nhà sản xuất</div>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-start gap-3"
            variants={fadeIn}
            whileHover={{ x: 3 }}
          >
            <ShieldCheckIcon className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">Bảo hành phần cơ khí 12 tháng, lưới 6 tháng</span>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-start gap-3"
            variants={fadeIn}
            whileHover={{ x: 3 }}
          >
            <TruckIcon className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">Vận chuyển toàn quốc, nhận hàng kiểm tra trước khi thanh toán</span>
            </div>
          </motion.div>
          <motion.div 
            className="flex items-start gap-3"
            variants={fadeIn}
            whileHover={{ x: 3 }}
          >
            <WrenchScrewdriverIcon className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">Miễn phí lắp đặt tại Hà Nội và TP. Hồ Chí Minh</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 