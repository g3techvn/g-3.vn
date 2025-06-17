import React from 'react';
import { ProductVariant } from '@/types';
import { cn } from '@/utils/cn';

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export function ProductVariants({ variants, selectedVariant, onSelectVariant }: ProductVariantsProps) {
  // Nếu không có variants hoặc chỉ có 1 variant mặc định, không hiển thị component
  if (!variants || variants.length <= 1) {
    return null;
  }

  // Lọc các màu sắc duy nhất và lấy variant đầu tiên cho mỗi màu
  const uniqueColors = Array.from(new Set(variants.map(v => v.color)));
  const colorVariants = uniqueColors.map(color => 
    variants.find(v => v.color === color)
  ).filter((v): v is ProductVariant => v !== undefined);

  // Kiểm tra xem có variant nào có thuộc tính gác chân không
  const hasGacChanOption = variants.some(variant => variant.gac_chan !== null && variant.gac_chan !== undefined);

  // Nếu không có biến thể màu sắc và không có tùy chọn gác chân, không hiển thị component
  if (colorVariants.length === 0 && !hasGacChanOption) {
    return null;
  }

  // Map màu sắc tiếng Việt sang mã màu CSS
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

  // Hàm tìm variant phù hợp khi chọn màu
  const handleColorSelect = (colorVariant: ProductVariant) => {
    // Nếu đang có gác chân được chọn, tìm variant cùng màu và cùng trạng thái gác chân
    if (selectedVariant?.gac_chan !== undefined) {
      const matchingVariant = variants.find(v => 
        v.color === colorVariant.color && 
        v.gac_chan === selectedVariant.gac_chan
      );
      if (matchingVariant) {
        onSelectVariant(matchingVariant);
        return;
      }
    }
    // Nếu không có gác chân hoặc không tìm thấy variant phù hợp, chọn variant màu mặc định
    onSelectVariant(colorVariant);
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-3 space-y-4">
      {/* Màu sắc */}
      {colorVariants.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-medium text-gray-900">Màu sắc:</span>
          <div className="flex flex-wrap gap-3">
            {colorVariants.map((variant) => {
              const colorCode = colorMap[variant.color.toLowerCase()] || variant.color;
              const isSelected = selectedVariant?.color === variant.color;
              return (
                <button
                  key={variant.color}
                  onClick={() => handleColorSelect(variant)}
                  className={cn(
                    "relative p-1 rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-blue-500"
                      : "border-gray-300 hover:border-blue-300"
                  )}
                  title={variant.color}
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
          {selectedVariant?.color && (
            <div className="text-sm text-gray-600">
              Đã chọn: <span className="font-medium text-gray-900">{selectedVariant.color}</span>
            </div>
          )}
        </div>
      )}

      {/* Gác chân */}
      {hasGacChanOption && (
        <div className="space-y-3">
          <span className="text-sm font-medium text-gray-900">Gác chân:</span>
          <div className="flex gap-3">
            {[true, false].map((hasGacChan) => {
              // Tìm variant phù hợp với màu hiện tại và trạng thái gác chân
              const matchingVariant = selectedVariant?.color
                ? variants.find(v => v.color === selectedVariant.color && v.gac_chan === hasGacChan)
                : variants.find(v => v.gac_chan === hasGacChan);

              if (!matchingVariant) return null;

              return (
                <button
                  key={hasGacChan ? 'with' : 'without'}
                  onClick={() => onSelectVariant(matchingVariant)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                    selectedVariant?.id === matchingVariant.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-blue-300 text-gray-700"
                  )}
                >
                  {hasGacChan ? 'Có kê chân' : 'Không có kê chân'}
                </button>
              );
            })}
          </div>
          {selectedVariant?.gac_chan !== undefined && (
            <div className="text-sm text-gray-600">
              Đã chọn: <span className="font-medium text-gray-900">
                {selectedVariant.gac_chan ? 'Có kê chân' : 'Không có kê chân'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 