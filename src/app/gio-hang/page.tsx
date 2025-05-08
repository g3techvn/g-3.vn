'use client';

import { useState, useEffect } from 'react';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import Image from 'next/image';
import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

interface CartItem extends Product {
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch gaming chairs specifically, limit to 3 items
        const response = await fetch('/api/products?category=gaming-chair&sort=created_at:desc&limit=3');
        
        if (!response.ok) {
          throw new Error(`Lỗi HTTP ${response.status}`);
        }
        
        const data = await response.json();
        // Convert products to cart items with quantity
        const items = (data.products || []).map((product: Product) => ({
          ...product,
          quantity: 1
        }));
        setCartItems(items);
      } catch (error: unknown) {
        console.error('Error fetching products:', error);
        setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 30000;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHomeHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Giỏ hàng</h1>
        <p className="text-gray-500 mb-8">Ghế Gaming của bạn</p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-md bg-red-50 p-4 text-red-600 border border-red-200"
          >
            <p className="font-medium">Đã xảy ra lỗi</p>
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded-full w-28"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-64 bg-white rounded-xl animate-pulse p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-full mt-8"></div>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 px-4"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Giỏ hàng trống</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Không có ghế gaming nào trong giỏ hàng của bạn
            </p>
            <a href="/" className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
              Tiếp tục mua sắm
            </a>
          </motion.div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {item.price.toLocaleString('vi-VN')}₫
                      </p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center rounded-full border border-gray-200 h-10">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:sticky lg:top-24 h-fit">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold mb-6 text-gray-900">Tổng đơn hàng</h2>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium">{shipping.toLocaleString('vi-VN')}₫</span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-800 font-medium">Tổng cộng</span>
                      <span className="text-xl font-bold text-gray-900">{total.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Đã bao gồm thuế VAT</p>
                  </div>
                </div>
                
                <button className="w-full bg-black text-white py-4 rounded-full mt-6 hover:bg-gray-800 transition-colors font-medium flex items-center justify-center space-x-2">
                  <span>Thanh toán ngay</span>
                </button>
                
                <div className="mt-4 text-center">
                  <a href="/" className="text-sm text-gray-500 hover:text-black transition-colors">
                    Tiếp tục mua sắm
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 