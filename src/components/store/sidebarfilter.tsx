'use client';

import { useState } from 'react';

interface SidebarFilterProps {
  onFilterChange: (filters: {
    priceRange: { min: number; max: number };
    brands: string[];
  }) => void;
  brands: string[];
}

export function SidebarFilter({ onFilterChange, brands }: SidebarFilterProps) {
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const newPriceRange = { ...priceRange, [type]: numValue };
    setPriceRange(newPriceRange);
    onFilterChange({ priceRange: newPriceRange, brands: selectedBrands });
  };

  const handleBrandChange = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    onFilterChange({ priceRange, brands: newBrands });
  };

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Bộ lọc</h3>
        
        {/* Price Range Filter */}
        <div className="mb-6">
          <h4 className="mb-3 font-medium">Khoảng giá</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="minPrice" className="mb-1 block text-sm text-gray-600">
                Giá tối thiểu
              </label>
              <input
                type="number"
                id="minPrice"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="mb-1 block text-sm text-gray-600">
                Giá tối đa
              </label>
              <input
                type="number"
                id="maxPrice"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="10000000"
              />
            </div>
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h4 className="mb-3 font-medium">Thương hiệu</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
