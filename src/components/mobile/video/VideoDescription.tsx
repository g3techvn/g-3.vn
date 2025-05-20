'use client';

interface VideoDescriptionProps {
  description?: string;
}

export function VideoDescription({ description = '' }: VideoDescriptionProps) {
  return (
    <div className="prose max-w-none px-4 mt-2 pb-8">
      <h2 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h2>
      <p className="text-gray-600 text-sm whitespace-pre-line">{description}</p>
    </div>
  );
} 