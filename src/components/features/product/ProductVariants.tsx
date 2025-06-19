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
    <div className="space-y-4">
      {/* Màu sắc */}
      {colorVariants.length > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Màu sắc:</span>
          <div className="flex flex-wrap gap-2">
            {colorVariants.map((variant) => {
              const colorCode = colorMap[variant.color.toLowerCase()] || variant.color;
              const isSelected = selectedVariant?.color === variant.color;
              return (
                <button
                  key={variant.color}
                  onClick={() => handleColorSelect(variant)}
                  className={cn(
                    "relative p-1 rounded-lg border transition-all",
                    isSelected
                      ? "border-primary"
                      : "border-gray-200 hover:border-primary/50"
                  )}
                  title={variant.color}
                >
                  <div 
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: colorCode }}
                  />
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gác chân */}
      {hasGacChanOption && (
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Gác chân:</span>
          <div className="flex gap-2">
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
                    "px-4 py-2 rounded-lg border transition-all",
                    selectedVariant?.id === matchingVariant.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-primary/50"
                  )}
                >
                  {hasGacChan ? 'Có kê chân' : 'Không có kê chân'}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 