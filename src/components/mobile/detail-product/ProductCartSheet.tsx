import React, { useState } from 'react';
import Image from 'next/image';
import { MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Product, ProductVariant } from '@/types';

interface TempCartItem {
  variant: ProductVariant;
  quantity: number;
}

interface ProductCartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant?: ProductVariant | null;
  onAddToCart: (product: Product, quantity: number, selectedVariant?: ProductVariant | null) => void;
}

export function ProductCartSheet({ isOpen, onClose, product, selectedVariant, onAddToCart }: ProductCartSheetProps) {
  const [tempItems, setTempItems] = useState<TempCartItem[]>([]);
  const [variantQuantities, setVariantQuantities] = useState<Record<number, number>>({});
  
  // Add current selected variant to temp list when sheet opens
  React.useEffect(() => {
    if (isOpen && selectedVariant) {
      const existingItem = tempItems.find(item => item.variant.id === selectedVariant.id);
      if (!existingItem) {
        setTempItems([{ variant: selectedVariant, quantity: 1 }]);
      }
      // Initialize quantity for selected variant
      setVariantQuantities(prev => ({
        ...prev,
        [selectedVariant.id]: prev[selectedVariant.id] || 1
      }));
    }
  }, [isOpen, selectedVariant]);

  // Reset temp items when sheet closes
  React.useEffect(() => {
    if (!isOpen) {
      setTempItems([]);
      setVariantQuantities({});
    }
  }, [isOpen]);

  // Initialize quantities for all variants
  React.useEffect(() => {
    if (product.variants) {
      const initialQuantities = product.variants.reduce((acc, variant) => {
        acc[variant.id] = 1;
        return acc;
      }, {} as Record<number, number>);
      setVariantQuantities(prev => ({ ...initialQuantities, ...prev }));
    }
  }, [product.variants]);

  const updateVariantQuantity = (variantId: number, quantity: number) => {
    setVariantQuantities(prev => ({
      ...prev,
      [variantId]: Math.max(1, Math.min(quantity, 99))
    }));
  };

  const addVariantToTemp = (variant: ProductVariant) => {
    const quantity = variantQuantities[variant.id] || 1;
    
    setTempItems(prev => {
      const existingIndex = prev.findIndex(item => item.variant.id === variant.id);
      if (existingIndex >= 0) {
        // Update existing item quantity
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        // Add new item
        return [...prev, { variant, quantity }];
      }
    });
  };

  const updateTempItemQuantity = (variantId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeTempItem(variantId);
      return;
    }
    setTempItems(prev => 
      prev.map(item => 
        item.variant.id === variantId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeTempItem = (variantId: number) => {
    setTempItems(prev => prev.filter(item => item.variant.id !== variantId));
  };

  const getTotalQuantity = () => {
    return tempItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return tempItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
  };

  // Calculate preview total including pending selections
  const getPreviewTotal = () => {
    const tempTotal = getTotalPrice();
    const pendingTotal = Object.entries(variantQuantities).reduce((sum, [variantId, quantity]) => {
      const variant = product.variants?.find(v => v.id === parseInt(variantId));
      const isAlreadyInTemp = tempItems.find(item => item.variant.id === parseInt(variantId));
      
      if (variant && !isAlreadyInTemp && quantity > 0) {
        return sum + (variant.price * quantity);
      }
      return sum;
    }, 0);
    
    return tempTotal + pendingTotal;
  };

  const getPreviewQuantity = () => {
    const tempQuantity = getTotalQuantity();
    const pendingQuantity = Object.entries(variantQuantities).reduce((sum, [variantId, quantity]) => {
      const isAlreadyInTemp = tempItems.find(item => item.variant.id === parseInt(variantId));
      
      if (!isAlreadyInTemp && quantity > 0) {
        return sum + quantity;
      }
      return sum;
    }, 0);
    
    return tempQuantity + pendingQuantity;
  };

  const handleConfirmAll = () => {
    // Add each item in temp list to cart
    tempItems.forEach(tempItem => {
      onAddToCart(product, tempItem.quantity, tempItem.variant);
    });
    setTempItems([]);
    onClose();
  };

  const getVariantDisplayName = (variant: ProductVariant) => {
    const parts = [];
    if (variant.color) parts.push(variant.color);
    if (variant.size) parts.push(variant.size);
    if (variant.gac_chan !== undefined) {
      parts.push(variant.gac_chan ? 'Có kê chân' : 'Không có kê chân');
    }
    return parts.join(' - ') || 'Mặc định';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl p-0 max-h-[85vh] flex flex-col">
        <SheetHeader className="p-4 border-b border-gray-100">
          <SheetTitle>Thêm vào giỏ hàng</SheetTitle>
        </SheetHeader>
        
        {/* Product info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
              <Image 
                src={product.image_url || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-medium text-gray-900 line-clamp-2">{product.name}</h4>
              <div className="mt-1 text-sm text-gray-500">
                Tạm tính: {getPreviewQuantity()} sản phẩm • {getPreviewTotal().toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>
        </div>

        {/* Available Variants for Selection */}
        {product.variants && product.variants.length > 1 && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-medium mb-3">Chọn phân loại và số lượng</h4>
            <div className="space-y-3">
              {product.variants.map(variant => {
                const existingItem = tempItems.find(item => item.variant.id === variant.id);
                const currentQuantity = variantQuantities[variant.id] || 1;
                
                return (
                  <div key={variant.id} className="p-3 bg-gray-50 rounded-lg">
                    {/* Variant Info */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{getVariantDisplayName(variant)}</div>
                        <div className="text-sm text-red-600">{variant.price.toLocaleString('vi-VN')}₫</div>
                        <div className="text-xs text-gray-500">Kho: {variant.stock_quantity}</div>
                      </div>
                      <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden">
                        <Image 
                          src={variant.image_url || product.image_url || '/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    </div>
                    
                    {/* Quantity Selection */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Số lượng:</span>
                        <div className="flex items-center">
                          <button 
                            onClick={() => updateVariantQuantity(variant.id, currentQuantity - 1)}
                            disabled={currentQuantity <= 1}
                            className={`w-7 h-7 flex items-center justify-center border border-gray-300 rounded-l text-gray-600 ${
                              currentQuantity <= 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'
                            }`}
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={currentQuantity}
                            onChange={(e) => updateVariantQuantity(variant.id, parseInt(e.target.value) || 1)}
                            className="w-12 h-7 text-center border-t border-b border-gray-300 text-sm focus:outline-none"
                          />
                          <button 
                            onClick={() => updateVariantQuantity(variant.id, currentQuantity + 1)}
                            disabled={currentQuantity >= 99}
                            className={`w-7 h-7 flex items-center justify-center border border-gray-300 rounded-r text-gray-600 ${
                              currentQuantity >= 99 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'
                            }`}
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => addVariantToTemp(variant)}
                        className={`px-4 py-1.5 text-sm rounded font-medium ${
                          existingItem 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {existingItem ? `Thêm ${currentQuantity}` : `Chọn ${currentQuantity}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Temporary Items List */}
        <div className="flex-1 overflow-y-auto">
          {tempItems.length > 0 ? (
            <div className="p-4">
              <h4 className="text-sm font-medium mb-3">Danh sách đã chọn ({tempItems.length})</h4>
              <div className="space-y-3">
                {tempItems.map(tempItem => (
                  <div key={tempItem.variant.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                      <Image 
                        src={tempItem.variant.image_url || product.image_url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{getVariantDisplayName(tempItem.variant)}</div>
                      <div className="text-sm text-red-600">{tempItem.variant.price.toLocaleString('vi-VN')}₫ × {tempItem.quantity}</div>
                      <div className="text-xs text-blue-600 font-medium">
                        = {(tempItem.variant.price * tempItem.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateTempItemQuantity(tempItem.variant.id, tempItem.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-white"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{tempItem.quantity}</span>
                      <button 
                        onClick={() => updateTempItemQuantity(tempItem.variant.id, tempItem.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-white"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeTempItem(tempItem.variant.id)}
                        className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Chưa có sản phẩm nào được chọn</p>
              <p className="text-xs mt-1">Chọn phân loại và số lượng ở trên</p>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <SheetFooter className="p-4 border-t border-gray-100">
          <div className="w-full space-y-3">
            {/* Preview total (including pending selections) */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-600">Tạm tính: {getPreviewQuantity()} sản phẩm</span>
                <span className="font-semibold text-gray-900">{getPreviewTotal().toLocaleString('vi-VN')}₫</span>
              </div>
              {tempItems.length > 0 && getPreviewQuantity() > getTotalQuantity() && (
                <div className="text-xs text-blue-600">
                  Đã chọn: {getTotalQuantity()} • Chưa chọn: {getPreviewQuantity() - getTotalQuantity()}
                </div>
              )}
            </div>
            
            {tempItems.length > 0 && (
              <Button 
                className="w-full bg-red-600 text-white h-12 text-base font-semibold shadow hover:bg-red-700 transition-colors rounded-lg"
                onClick={handleConfirmAll}
              >
                Thêm {getTotalQuantity()} sản phẩm vào giỏ hàng
              </Button>
            )}
            
            {tempItems.length === 0 && getPreviewQuantity() > 0 && (
              <div className="text-center text-gray-500">
                <p className="text-sm">Bạn đã cài đặt {getPreviewQuantity()} sản phẩm</p>
                <p className="text-xs">Nhấn "Chọn" để thêm vào danh sách</p>
              </div>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 