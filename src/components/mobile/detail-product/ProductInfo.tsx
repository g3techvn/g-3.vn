import React from 'react';

interface ProductInfoProps {
  name: string;
  tags?: string[];
}

export function ProductInfo({ name, tags = [] }: ProductInfoProps) {
  return (
    <div className="bg-white mb-2">
      <h1 className="text-lg font-medium text-gray-900 px-4 pt-2 pb-2">{name}</h1>
      <div className="flex flex-wrap gap-2 mt-2 bg-red-50 justify-start w-full px-4 py-2">
        <span className="text-gray-700 font-semibold px-3 py-1 text-xs">Giảm giá 30%</span>
        <span className="text-gray-700">•</span>
        <span className="text-gray-700 font-semibold px-3 py-1 text-xs">Giao hoả tốc HN HCM</span>
        <span className="text-gray-700">•</span>
        <span className="text-gray-700 font-semibold px-3 py-1 text-xs">Miễn phí vận chuyển</span>
      </div>

      {/* Tag thể loại */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 mt-2">
          {tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium border border-red-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 