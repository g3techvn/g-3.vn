import React from 'react';

interface ProductDescriptionProps {
  description?: string;
}

export function ProductDescription({ description = '' }: ProductDescriptionProps) {
  return (
    <div className="prose max-w-none px-4 mt-2 pb-8">
      <h2 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h2>
      <p className="text-gray-600 text-sm whitespace-pre-line">{description}</p>
    </div>
  );
} 