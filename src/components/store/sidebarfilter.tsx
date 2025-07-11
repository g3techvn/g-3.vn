'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/types';

interface SidebarFilterProps {
  onFilterChange: (filters: {
    priceRange: { min: number; max: number };
    brandIds: number[];
    categoryIds: number[];
  }) => void;
  maxPrice: number;
  products: Product[];
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

export function SidebarFilter({ onFilterChange, maxPrice, products }: SidebarFilterProps) {
  // Đảm bảo maxPrice luôn có giá trị hợp lệ
  const effectiveMaxPrice = maxPrice || 10000000;
  const [priceRange, setPriceRange] = useState({ min: 0, max: effectiveMaxPrice });
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [errorBrands, setErrorBrands] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  
  // Refs để theo dõi brands và categories đã tải từ API
  const allBrandsRef = useRef<Brand[]>([]);
  const allCategoriesRef = useRef<Category[]>([]);

  // Cập nhật lại priceRange khi maxPrice thay đổi
  useEffect(() => {
    if (effectiveMaxPrice > 0) {
      setPriceRange(prev => ({
        min: Math.min(prev.min, effectiveMaxPrice),
        max: effectiveMaxPrice
      }));
    }
  }, [effectiveMaxPrice]);

  // Lấy danh sách brands từ API
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const res = await fetch('/api/brands');
        const data = await res.json();
        const fetchedBrands = data.brands || [];
        // Lưu tất cả brands vào ref
        allBrandsRef.current = fetchedBrands;
        setBrands(fetchedBrands);
      } catch (err) {
        setErrorBrands('Không thể tải danh sách thương hiệu');
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // Lấy danh sách categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        const fetchedCategories = data.product_cats || [];
        // Lưu tất cả categories vào ref
        allCategoriesRef.current = fetchedCategories;
        setCategories(fetchedCategories);
      } catch (err) {
        setErrorCategories('Không thể tải danh sách danh mục');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Lọc danh sách thương hiệu và danh mục dựa trên sản phẩm hiện tại
  useEffect(() => {
    if (products.length > 0 && !loadingBrands && !loadingCategories) {
      // Tạo Set các ID từ sản phẩm hiện tại
      const productBrandIds = new Set(products.map(product => Number(product.brand_id)).filter(Boolean));
      const productCategoryIds = new Set(products.map(product => Number(product.pd_cat_id)).filter(Boolean));
      
      // Lọc brands từ danh sách gốc
      const availableBrands = allBrandsRef.current.filter(brand => productBrandIds.has(brand.id));
      const availableCategories = allCategoriesRef.current.filter(category => productCategoryIds.has(category.id));
      
      // So sánh để kiểm tra có cần update state không
      const brandsChanged = JSON.stringify(availableBrands.map(b => b.id)) !== JSON.stringify(brands.map(b => b.id));
      const categoriesChanged = JSON.stringify(availableCategories.map(c => c.id)) !== JSON.stringify(categories.map(c => c.id));
      
      // Chỉ cập nhật state khi có thay đổi thực sự
      if (brandsChanged) {
        setBrands(availableBrands);
      }
      
      if (categoriesChanged) {
        setCategories(availableCategories);
      }
      
      // Cập nhật selected IDs
      const newSelectedBrandIds = selectedBrandIds.filter(id => productBrandIds.has(id));
      if (JSON.stringify(newSelectedBrandIds) !== JSON.stringify(selectedBrandIds)) {
        setSelectedBrandIds(newSelectedBrandIds);
      }
      
      const newSelectedCategoryIds = selectedCategoryIds.filter(id => productCategoryIds.has(id));
      if (JSON.stringify(newSelectedCategoryIds) !== JSON.stringify(selectedCategoryIds)) {
        setSelectedCategoryIds(newSelectedCategoryIds);
      }
    }
  }, [products, loadingBrands, loadingCategories, brands, categories, selectedBrandIds, selectedCategoryIds]);

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
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hidden md:block">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Bộ lọc</h3>
        
        {/* Price Range Filter */}
        <div className="mb-6">
          <h4 className="mb-3 font-medium">Khoảng giá</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Giá tối thiểu</label>
              <input
                type="range"
                min={0}
                max={effectiveMaxPrice}
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">
                {priceRange.min.toLocaleString()}₫
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Giá tối đa</label>
              <input
                type="range"
                min={0}
                max={effectiveMaxPrice}
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">
                {priceRange.max.toLocaleString()}₫
              </div>
            </div>
          </div>
        </div>

        {/* Brand Filter */}
        <div className="mb-6">
          <h4 className="mb-3 font-medium">Thương hiệu</h4>
          {loadingBrands ? (
            <div>Đang tải...</div>
          ) : errorBrands ? (
            <div className="text-red-500 text-sm">{errorBrands}</div>
          ) : brands.length === 0 ? (
            <div className="text-sm text-gray-500">Không có thương hiệu</div>
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

        {/* Category Filter */}
        <div className="mb-6">
          <h4 className="mb-3 font-medium">Danh mục</h4>
          {loadingCategories ? (
            <div>Đang tải...</div>
          ) : errorCategories ? (
            <div className="text-red-500 text-sm">{errorCategories}</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-gray-500">Không có danh mục</div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">{category.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
