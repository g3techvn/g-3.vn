'use client';

import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface SidebarFilterProps {
  onFilterChange: (filters: {
    priceRange: { min: number; max: number };
    brandIds: number[];
    categoryIds: number[];
  }) => void;
  maxPrice: number;
}

interface Brand {
  id: number;
  title: string;
  slug: string;
  image_url?: string;
}

interface Category {
  id: number;
  title: string;
  slug: string;
  description?: string;
}

export function SidebarFilter({ onFilterChange, maxPrice }: SidebarFilterProps) {
  const [priceRange, setPriceRange] = useState({ min: 0, max: maxPrice });
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [errorBrands, setErrorBrands] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const res = await fetch('/api/brands');
        const data = await res.json();
        setBrands(data.brands || []);
      } catch (err) {
        setErrorBrands('Không thể tải danh sách thương hiệu');
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.product_cats || []);
      } catch (err) {
        setErrorCategories('Không thể tải danh sách danh mục');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Gọi onFilterChange mỗi khi filter thay đổi
  useEffect(() => {
    onFilterChange({ priceRange, brandIds: selectedBrandIds, categoryIds: selectedCategoryIds });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange, selectedBrandIds, selectedCategoryIds]);

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const newPriceRange = { ...priceRange, [type]: numValue };
    setPriceRange(newPriceRange);
  };

  const handleBrandChange = (brandId: number) => {
    const newBrandIds = selectedBrandIds.includes(brandId)
      ? selectedBrandIds.filter((id) => id !== brandId)
      : [...selectedBrandIds, brandId];
    setSelectedBrandIds(newBrandIds);
  };

  const handleCategoryChange = (categoryId: number) => {
    const newCategoryIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    setSelectedCategoryIds(newCategoryIds);
  };

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Bộ lọc</h3>
        {/* Brand Filter - Đưa lên đầu */}
        <div className="mb-6">
          <h4 className="mb-3 font-medium">Thương hiệu</h4>
          {loadingBrands ? (
            <div>Đang tải...</div>
          ) : errorBrands ? (
            <div className="text-red-500 text-sm">{errorBrands}</div>
          ) : (
            <div className="space-y-2">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedBrandIds.includes(brand.id)}
                    onChange={() => handleBrandChange(brand.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{brand.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Category Filter - Thứ hai */}
        <div className="mb-6">
          <h4 className="mb-3 font-medium">Danh mục</h4>
          {loadingCategories ? (
            <div>Đang tải...</div>
          ) : errorCategories ? (
            <div className="text-red-500 text-sm">{errorCategories}</div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => handleCategoryChange(cat.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{cat.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Price Range Filter - Cuối cùng */}
        <div className="mb-6">
          <h4 className="mb-3 font-medium">Khoảng giá</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 w-20">Từ</span>
              <span className="text-sm text-gray-800 w-24 text-right">{priceRange.min.toLocaleString()}</span>
              <span className="text-sm text-gray-600 w-12 text-center">-</span>
              <span className="text-sm text-gray-800 w-24 text-right">{priceRange.max.toLocaleString()}</span>
              <span className="text-sm text-gray-600 w-20">Đến</span>
            </div>
            <div className="px-2">
              <Slider
                range
                min={0}
                max={maxPrice}
                step={500000}
                value={[priceRange.min, priceRange.max]}
                onChange={(val) => {
                  if (Array.isArray(val) && val.length === 2) setPriceRange({ min: val[0], max: val[1] });
                }}
                onAfterChange={(val) => {
                  if (Array.isArray(val) && val.length === 2) setPriceRange({ min: val[0], max: val[1] });
                }}
                allowCross={false}
                trackStyle={[{ backgroundColor: '#2563eb' }]}
                handleStyle={[
                  { borderColor: '#2563eb', backgroundColor: '#fff' },
                  { borderColor: '#2563eb', backgroundColor: '#fff' }
                ]}
                railStyle={{ backgroundColor: '#e5e7eb' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
