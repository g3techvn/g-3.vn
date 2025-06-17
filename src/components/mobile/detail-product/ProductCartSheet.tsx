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
  const [noVariantQuantity, setNoVariantQuantity] = useState(1); // For products without variants
  
  // For multi-selection of attributes
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGacChans, setSelectedGacChans] = useState<boolean[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>([]);
  const [variantQuantities, setVariantQuantities] = useState<Record<number, number>>({});
  
  // Color map for display
  const colorMap: { [key: string]: string } = {
    'black': '#000000',
    'gray': '#808080', 
    'white': '#FFFFFF',
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'orange': '#FFA500',
    'brown': '#A52A2A',
    'silver': '#C0C0C0',
    'gold': '#FFD700',
  };

  // Get unique colors and gac_chan options
  const uniqueColors = Array.from(new Set(product.variants?.map(v => v.color).filter(Boolean) || []));
  const uniqueGacChans = Array.from(new Set(product.variants?.map(v => v.gac_chan).filter(v => v !== null && v !== undefined) || []));
  const hasGacChanOption = uniqueGacChans.length > 0;

  // Generate selected variants based on attribute selections
  React.useEffect(() => {
    if (!product.variants) return;
    
    const variants: ProductVariant[] = [];
    
    // If no attributes selected, use all variants
    if (selectedColors.length === 0 && selectedGacChans.length === 0) {
      setSelectedVariants([]);
      return;
    }
    
    // Generate combinations of selected attributes
    if (selectedColors.length > 0 && hasGacChanOption && selectedGacChans.length > 0) {
      // Both color and gac_chan selected
      selectedColors.forEach(color => {
        selectedGacChans.forEach(gacChan => {
          const variant = product.variants?.find(v => v.color === color && v.gac_chan === gacChan);
          if (variant) variants.push(variant);
        });
      });
    } else if (selectedColors.length > 0) {
      // Only colors selected
      selectedColors.forEach(color => {
        if (hasGacChanOption) {
          // Find variants with this color
          const colorVariants = product.variants?.filter(v => v.color === color) || [];
          variants.push(...colorVariants);
        } else {
          const variant = product.variants?.find(v => v.color === color);
          if (variant) variants.push(variant);
        }
      });
    } else if (selectedGacChans.length > 0) {
      // Only gac_chan selected
      selectedGacChans.forEach(gacChan => {
        const gacChanVariants = product.variants?.filter(v => v.gac_chan === gacChan) || [];
        variants.push(...gacChanVariants);
      });
    }
    
    setSelectedVariants(variants);
    
    // Initialize quantities for selected variants
    const newQuantities: Record<number, number> = {};
    variants.forEach(variant => {
      newQuantities[variant.id] = variantQuantities[variant.id] || 1;
    });
    setVariantQuantities(newQuantities);
  }, [selectedColors, selectedGacChans, product.variants, hasGacChanOption]);

  // Reset temp items when sheet closes
  React.useEffect(() => {
    if (!isOpen) {
      setTempItems([]);
      setVariantQuantities({});
      setSelectedColors([]);
      setSelectedGacChans([]);
      setSelectedVariants([]);
    }
  }, [isOpen]);

  // Handle color selection (multi-select)
  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  // Handle gac_chan selection (multi-select)
  const toggleGacChan = (gacChan: boolean) => {
    setSelectedGacChans(prev => 
      prev.includes(gacChan) 
        ? prev.filter(g => g !== gacChan)
        : [...prev, gacChan]
    );
  };

  const updateVariantQuantity = (variantId: number, quantity: number) => {
    setVariantQuantities(prev => ({
      ...prev,
      [variantId]: Math.max(1, Math.min(quantity, 99))
    }));
  };

  const getTotalQuantity = () => {
    return selectedVariants.reduce((sum, variant) => sum + (variantQuantities[variant.id] || 0), 0);
  };

  const getTotalPrice = () => {
    return selectedVariants.reduce((sum, variant) => {
      const quantity = variantQuantities[variant.id] || 0;
      return sum + (variant.price * quantity);
    }, 0);
  };

  // Calculate preview total and quantity
  const getPreviewTotal = () => {
    // For products without variants, use noVariantQuantity
    if (!product.variants || product.variants.length === 0) {
      return product.price * noVariantQuantity;
    }
    
    return getTotalPrice();
  };

  const getPreviewQuantity = () => {
    // For products without variants, use noVariantQuantity
    if (!product.variants || product.variants.length === 0) {
      return noVariantQuantity;
    }
    
    return getTotalQuantity();
  };

  const handleConfirmAll = () => {
    // For products without variants, add directly
    if (!product.variants || product.variants.length === 0) {
      onAddToCart(product, noVariantQuantity, null);
      setNoVariantQuantity(1);
      onClose();
      return;
    }
    
    // Add each selected variant to cart
    selectedVariants.forEach(variant => {
      const quantity = variantQuantities[variant.id] || 1;
      if (quantity > 0) {
        onAddToCart(product, quantity, variant);
      }
    });
    
    // Reset selections
    setSelectedColors([]);
    setSelectedGacChans([]);
    setSelectedVariants([]);
    setVariantQuantities({});
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

        {/* No Variants - Simple Quantity Selection */}
        {(!product.variants || product.variants.length === 0) && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-medium mb-3">Chọn số lượng</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Số lượng:</span>
                <div className="flex items-center">
                  <button 
                    onClick={() => setNoVariantQuantity(Math.max(1, noVariantQuantity - 1))}
                    disabled={noVariantQuantity <= 1}
                    className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l text-gray-600 ${
                      noVariantQuantity <= 1 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'
                    }`}
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={noVariantQuantity}
                    onChange={(e) => setNoVariantQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                    className="w-16 h-8 text-center border-t border-b border-gray-300 text-sm focus:outline-none"
                  />
                  <button 
                    onClick={() => setNoVariantQuantity(Math.min(99, noVariantQuantity + 1))}
                    disabled={noVariantQuantity >= 99}
                    className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r text-gray-600 ${
                      noVariantQuantity >= 99 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'
                    }`}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-red-600 font-medium">
                = {(product.price * noVariantQuantity).toLocaleString('vi-VN')}₫
              </div>
            </div>
          </div>
        )}

        {/* Multi-Attribute Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="p-4 border-b border-gray-100 space-y-4">
            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-900">Màu sắc (có thể chọn nhiều):</span>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((color) => {
                    const colorCode = colorMap[color.toLowerCase()] || color;
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => toggleColor(color)}
                        className={`relative p-1 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-blue-500"
                            : "border-gray-300 hover:border-blue-300"
                        }`}
                        title={color}
                      >
                        <div 
                          className="w-10 h-10 rounded-md"
                          style={{ backgroundColor: colorCode }}
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedColors.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Đã chọn: <span className="font-medium text-gray-900">{selectedColors.join(', ')}</span>
                  </div>
                )}
              </div>
            )}

            {/* Gac Chan Selection */}
            {hasGacChanOption && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-gray-900">Gác chân (có thể chọn nhiều):</span>
                <div className="flex gap-3">
                  {[true, false].map((hasGacChan) => {
                    const isSelected = selectedGacChans.includes(hasGacChan);
                    return (
                      <button
                        key={hasGacChan ? 'with' : 'without'}
                        onClick={() => toggleGacChan(hasGacChan)}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 hover:border-blue-300 text-gray-700"
                        }`}
                      >
                        {hasGacChan ? 'Có kê chân' : 'Không có kê chân'}
                      </button>
                    );
                  })}
                </div>
                {selectedGacChans.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Đã chọn: <span className="font-medium text-gray-900">
                      {selectedGacChans.map(g => g ? 'Có kê chân' : 'Không có kê chân').join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Selected Variants List with Quantities */}
        <div className="flex-1 overflow-y-auto">
          {selectedVariants.length > 0 ? (
            <div className="p-4">
              <h4 className="text-sm font-medium mb-3">Danh sách sản phẩm đã chọn ({selectedVariants.length})</h4>
              <div className="space-y-3">
                {selectedVariants.map(variant => {
                  const currentQuantity = variantQuantities[variant.id] || 1;
                  return (
                    <div key={variant.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                        <Image 
                          src={variant.image_url || product.image_url || '/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{getVariantDisplayName(variant)}</div>
                        <div className="text-sm text-red-600">{variant.price.toLocaleString('vi-VN')}₫ × {currentQuantity}</div>
                        <div className="text-xs text-blue-600 font-medium">
                          = {(variant.price * currentQuantity).toLocaleString('vi-VN')}₫
                        </div>
                        <div className="text-xs text-gray-500">Kho: {variant.stock_quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateVariantQuantity(variant.id, currentQuantity - 1)}
                          disabled={currentQuantity <= 1}
                          className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 ${
                            currentQuantity <= 1 ? 'bg-gray-200 text-gray-400' : 'hover:bg-white'
                          }`}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{currentQuantity}</span>
                        <button 
                          onClick={() => updateVariantQuantity(variant.id, currentQuantity + 1)}
                          disabled={currentQuantity >= 99}
                          className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 ${
                            currentQuantity >= 99 ? 'bg-gray-200 text-gray-400' : 'hover:bg-white'
                          }`}
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Chưa có sản phẩm nào được chọn</p>
              <p className="text-xs mt-1">Chọn thuộc tính ở trên để xem các sản phẩm tương ứng</p>
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
            
            {/* Add to Cart Button */}
            {((!product.variants || product.variants.length === 0) || selectedVariants.length > 0) && (
              <Button 
                className="w-full bg-red-600 text-white h-12 text-base font-semibold shadow hover:bg-red-700 transition-colors rounded-lg"
                onClick={handleConfirmAll}
              >
                {(!product.variants || product.variants.length === 0) 
                  ? `Thêm ${noVariantQuantity} sản phẩm vào giỏ hàng`
                  : `Thêm ${getTotalQuantity()} sản phẩm vào giỏ hàng`
                }
              </Button>
            )}
            
            {product.variants && product.variants.length > 0 && selectedVariants.length === 0 && (
              <div className="text-center text-gray-500">
                <p className="text-sm">Chọn thuộc tính để xem sản phẩm</p>
                <p className="text-xs">Bạn có thể chọn nhiều màu sắc và tùy chọn khác nhau</p>
              </div>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 