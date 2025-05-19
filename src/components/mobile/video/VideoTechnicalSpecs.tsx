'use client';

interface TechnicalSpec {
  title: string;
  value: string;
}

interface VideoTechnicalSpecsProps {
  specifications: TechnicalSpec[];
}

export function VideoTechnicalSpecs({ specifications }: VideoTechnicalSpecsProps) {
  if (!specifications || specifications.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
        <div className="text-sm text-gray-500 italic">
          Thông số kỹ thuật đang được cập nhật...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
      <div className="space-y-2">
        {specifications.map((spec, index) => (
          <div key={index} className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">{spec.title}</span>
            <span className="text-sm text-gray-900">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 