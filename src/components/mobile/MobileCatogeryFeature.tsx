import React, { useState } from 'react';

const BRANDS = [
  { name: 'G3-TECH', logo: '/brands/g3-tech.png' },
  { name: 'Gami', logo: '/brands/gami.png' },
  { name: 'Sihoo', logo: '/brands/sihoo.png' },
  { name: 'Xiaomi', logo: '/brands/xiaomi.png' },
];

const MobileCatogeryFeature = () => {
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const handleImageError = (brandName: string) => {
    setImageErrors(prev => ({
      ...prev,
      [brandName]: true
    }));
  };

  return (
    <section className="pt-4">
      <div className="flex items-center px-4 mb-2">
        <h2 className="text-lg font-semibold text-red-700">Thương hiệu ưa chuộng</h2>
      </div>
      <div className="grid grid-cols-4 gap-4 px-4">
        {BRANDS.map((brand) => (
          <div key={brand.name} className="flex flex-col items-center bg-gray-50 rounded-lg p-2 shadow-sm">
            {!imageErrors[brand.name] ? (
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="w-14 h-14 object-contain mb-2"
                onError={() => handleImageError(brand.name)}
              />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-full mb-2">
                <span className="text-xs font-medium text-gray-600">{brand.name.charAt(0)}</span>
              </div>
            )}
            <span className="text-xs text-gray-700 text-center font-medium">{brand.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MobileCatogeryFeature; 