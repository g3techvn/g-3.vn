import React, { useState } from 'react';
import Image from 'next/image';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types';

interface ProductCartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product, quantity: number, selectedColor: string) => void;
}

export function ProductCartSheet({ isOpen, onClose, product, onAddToCart }: ProductCartSheetProps) {
  const [selectedColor, setSelectedColor] = useState<string>('Đen');
  const [quantity, setQuantity] = useState(1);
  
  // Available colors - mockup data
  const colors = ['Đen', 'Xám', 'Đen Hồng'];
  
  const handleConfirm = () => {
    onAddToCart(product, quantity, selectedColor);
    onClose();
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 99));
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl p-0">
        <SheetHeader>
          <SheetTitle>Thêm vào giỏ hàng</SheetTitle>
        </SheetHeader>
        
        {/* Product info */}
        <div className="p-4 flex items-center gap-3 border-b border-gray-100">
          <div className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
            <Image 
              src={product.image_url || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-medium text-gray-900 line-clamp-2">{product.name}</h4>
            <div className="mt-1 text-red-600 font-semibold">
              {product.price?.toLocaleString('vi-VN')}₫
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Kho: 999
            </div>
          </div>
        </div>
        
        {/* Color options */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-base font-medium mb-3">Màu Sắc</h4>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 border rounded-lg text-sm ${
                  selectedColor === color 
                    ? 'border-red-500 text-red-600 bg-red-50' 
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
        
        {/* Quantity */}
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-base font-medium mb-3">Số lượng</h4>
          <div className="flex items-center w-32">
            <button 
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg ${
                quantity <= 1 ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <MinusIcon className="w-5 h-5" />
            </button>
            <div className="w-12 h-10 flex items-center justify-center border-t border-b border-gray-300 text-center">
              {quantity}
            </div>
            <button 
              onClick={incrementQuantity}
              className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg text-gray-700"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Action buttons */}
        <SheetFooter>
          <Button 
            className="w-full bg-red-600 text-white h-12 text-base font-semibold shadow hover:bg-red-700 transition-colors rounded-lg flex items-center justify-center"
            onClick={handleConfirm}
          >
            Xác nhận
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 