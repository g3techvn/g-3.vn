import React, { useState } from 'react';

interface Specification {
  title?: string;
  name?: string;
  value: string;
}

interface TechnicalSpecsProps {
  specifications: Specification[];
}

export function TechnicalSpecs({ specifications }: TechnicalSpecsProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!specifications || specifications.length === 0) {
    return null;
  }

  const visibleSpecs = expanded ? specifications : specifications.slice(0, 4);
  const hasMore = specifications.length > 4;

  return (
    <div className="bg-gray-50 rounded-lg shadow-sm p-4 mb-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
      <div>
        {visibleSpecs.map((spec, index) => (
          <div
            key={index}
            className={`flex items-start py-3 ${index < visibleSpecs.length - 1 ? 'border-b border-gray-200' : ''}`}
          >
            <span className="font-semibold flex-[2_2_0%] text-left text-sm">
              {spec.title || spec.name}
            </span>
            <span className="flex-[3_3_0%] text-left text-sm">
              {typeof spec.value === 'string' ? spec.value : JSON.stringify(spec.value)}
            </span>
          </div>
        ))}
        {hasMore && (
          <div className="flex justify-center pt-3">
            <button
              className="font-semibold flex items-center gap-2 focus:outline-none text-sm"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? 'Thu gọn' : 'Xem thêm'}
              <svg
                width="20"
                height="20"
                fill="none"
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <path d="M6 8l4 4 4-4" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 