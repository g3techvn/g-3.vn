import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Brand } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface MobileCatogeryFeatureProps {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  categorySlug?: string;
}

const MobileCatogeryFeature: React.FC<MobileCatogeryFeatureProps> = React.memo(({ 
  brands,
  loading,
  error,
  categorySlug
}) => {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  // Store previous brands to prevent flickering
  const prevBrandsRef = useRef<Brand[]>([]);
  // Store stabilized brands that only update when appropriate
  const [stableBrands, setStableBrands] = useState<Brand[]>([]);
  
  // Update stable brands when appropriate
  useEffect(() => {
    // Only update when we have brands and not loading
    if (brands.length > 0 && !loading) {
      // If we didn't have brands before or we have more brands now, update
      if (prevBrandsRef.current.length === 0 || brands.length >= prevBrandsRef.current.length) {
        setStableBrands(brands);
        prevBrandsRef.current = brands;
      } 
      // If filtering resulted in fewer brands, only update if it's not a drastic reduction
      else if (brands.length > 0 && brands.length >= prevBrandsRef.current.length * 0.5) {
        setStableBrands(brands);
        prevBrandsRef.current = brands;
      }
    }
  }, [brands, loading]);
  
  // Đặt tiêu đề dựa trên category
  const title = 'Thương hiệu ưa chuộng';

  const handleImageError = useCallback((brandId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [brandId]: true
    }));
  }, []);

  // Lấy tối đa 4 thương hiệu để hiển thị, memoize để tránh tính toán lại khi component re-render
  const displayBrands = useMemo(() => {
    // Use stable brands if available, otherwise fallback to props
    const brandsToDisplay = stableBrands.length > 0 ? stableBrands : brands;
    return brandsToDisplay.slice(0, 4);
  }, [brands, stableBrands]);

  // Tránh re-render khi loading và không có brands
  if (loading) {
    return (
      <section className="pt-4">
        <div className="flex items-center px-4 mb-2">
          <h2 className="text-lg font-semibold text-red-700">{title}</h2>
        </div>
        <div className="grid grid-cols-4 gap-4 px-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center bg-gray-50 rounded-lg p-2 shadow-sm animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-full mb-2" />
              <div className="h-4 w-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pt-4">
        <div className="flex items-center px-4 mb-2">
          <h2 className="text-lg font-semibold text-red-700">{title}</h2>
        </div>
        <div className="grid grid-cols-4 gap-4 px-4">
          <div className="col-span-4 text-center text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-4">
      <div className="flex items-center px-4 mb-2">
        <h2 className="text-lg font-semibold text-red-700">{title}</h2>
      </div>
      <div className="grid grid-cols-4 gap-4 px-4">
        {displayBrands.length > 0 ? (
          displayBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug || brand.id}`}
              className="flex flex-col items-center bg-gray-50 rounded-lg p-1 shadow-sm hover:shadow-md transition-shadow"
            >
              {brand.image_url && !imageErrors[brand.id] ? (
                <Image
                  src={brand.image_url}
                  alt={brand.title}
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain rounded-lg mb-2"
                  onError={() => handleImageError(brand.id)}
                />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-lg mb-2">
                  <span className="text-xs font-medium text-gray-600">{brand.title.charAt(0)}</span>
                </div>
              )}
              <span className="text-xs text-gray-700 text-center font-medium">{brand.title}</span>
            </Link>
          ))
        ) : (
          <div className="col-span-4 text-center text-gray-600">Không tìm thấy thương hiệu nào.</div>
        )}
      </div>
    </section>
  );
});

// Add display name for debugging
MobileCatogeryFeature.displayName = 'MobileCatogeryFeature';

export default MobileCatogeryFeature; 