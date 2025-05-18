import React from 'react';
import * as Separator from '@radix-ui/react-separator';

interface Specification {
  title: string;
  value: string;
}

interface TechnicalSpecsProps {
  specifications: Specification[];
}

export function TechnicalSpecs({ specifications }: TechnicalSpecsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
      <div>
        {specifications.map((spec, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-between py-3">
              <span className="font-semibold">{spec.title}</span>
              <span className="text-right">{spec.value}</span>
            </div>
            {index < specifications.length - 1 && (
              <Separator.Root className="h-px bg-gray-200" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 