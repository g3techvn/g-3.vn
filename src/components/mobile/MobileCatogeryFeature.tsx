import React, { useState, useEffect } from 'react';
import { Brand } from '@/types';

const MobileCatogeryFeature = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brands');
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleImageError = (brandId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [brandId]: true
    }));
  };

  return (
    <section className="pt-4">
      <div className="flex items-center px-4 mb-2">
        <h2 className="text-lg font-semibold text-red-700">Thương hiệu ưa chuộng</h2>
      </div>
      <div className="grid grid-cols-4 gap-4 px-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center bg-gray-50 rounded-lg p-2 shadow-sm animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-full mb-2" />
              <div className="h-4 w-10 bg-gray-200 rounded" />
            </div>
          ))
        ) : error ? (
          <div className="col-span-4 text-center text-red-600">{error}</div>
        ) : brands.length > 0 ? (
          brands.slice(0, 4).map((brand) => (
            <div key={brand.id} className="flex flex-col items-center bg-gray-50 rounded-lg p-1 shadow-sm">
              {brand.image_url && !imageErrors[brand.id] ? (
                <img
                  src={brand.image_url}
                  alt={brand.title}
                  className="w-14 h-14 object-contain rounded-lg mb-2"
                  onError={() => handleImageError(brand.id)}
                />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-lg mb-2">
                  <span className="text-xs font-medium text-gray-600">{brand.title.charAt(0)}</span>
                </div>
              )}
              <span className="text-xs text-gray-700 text-center font-medium">{brand.title}</span>
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center text-gray-600">Không tìm thấy thương hiệu nào.</div>
        )}
      </div>
    </section>
  );
};

export default MobileCatogeryFeature; 