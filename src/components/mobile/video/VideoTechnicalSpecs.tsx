'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface TechnicalSpec {
  name: string;
  value: string;
}

interface VideoTechnicalSpecsProps {
  specifications: TechnicalSpec[];
}

export function VideoTechnicalSpecs({ specifications }: VideoTechnicalSpecsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!specifications || specifications.length === 0) {
    return null;
  }

  const displayedSpecs = isExpanded 
    ? specifications 
    : specifications.slice(0, 4);
  
  const hasMoreSpecs = specifications.length > 4;

  return (
    <div className="px-4 py-5 bg-white rounded-lg mb-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông số kỹ thuật</h3>
      <div className="grid grid-cols-1 gap-4">
        {displayedSpecs.map((spec, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900 mb-1">{spec.name}</div>
            <div className="text-sm text-gray-500">{spec.value}</div>
          </div>
        ))}
      </div>
      
      {hasMoreSpecs && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full flex items-center justify-center py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
        >
          {isExpanded ? (
            <>
              <span>Thu gọn</span>
              <ChevronUpIcon className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              <span>Xem thêm {specifications.length - 4} thông số</span>
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </>
          )}
        </button>
      )}
    </div>
  );
} 