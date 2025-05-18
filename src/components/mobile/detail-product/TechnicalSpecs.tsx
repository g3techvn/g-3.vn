import React from 'react';

interface TechnicalSpecsProps {
  specifications: Array<{ name: string; value: string }>;
}

export function TechnicalSpecs({ specifications }: TechnicalSpecsProps) {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-5 bg-white rounded-lg mb-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông số kỹ thuật</h3>
      <div className="space-y-3">
        {specifications.map((spec, index) => (
          <div key={index} className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-500">{spec.name}</span>
            <span className="text-sm font-medium text-gray-900">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 