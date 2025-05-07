'use client';

import React, { useState, useEffect } from 'react';

interface FilterProps {
  onFilter: (filters: {
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    source?: string;
    brand?: string;
  }) => void;
  currentFilter?: {
    minPrice?: number;
    maxPrice?: number;
    sort: string;
    source: string;
    brand?: string;
  };
}

// Danh sách thương hiệu có sẵn
const BRANDS = [
  { id: 'all', name: 'Tất cả thương hiệu' },
  { id: 'Gami', name: 'Gami Việt Nam' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'jewelery', name: 'Jewelery' },
  { id: "men's clothing", name: "Men's Clothing" },
  { id: "women's clothing", name: "Women's Clothing" },
];

export default function ProductFilter({ onFilter, currentFilter }: FilterProps) {
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sort, setSort] = useState<string>('newest');
  const [source, setSource] = useState<string>('gami');
  const [brand, setBrand] = useState<string>('all');

  // Cập nhật trạng thái local từ props nếu có
  useEffect(() => {
    if (currentFilter) {
      setMinPrice(currentFilter.minPrice ? currentFilter.minPrice.toString() : '');
      setMaxPrice(currentFilter.maxPrice ? currentFilter.maxPrice.toString() : '');
      setSort(currentFilter.sort || 'newest');
      setSource(currentFilter.source || 'gami');
      setBrand(currentFilter.brand || 'all');
    }
  }, []);

  const handleApplyFilter = () => {
    onFilter({
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      sort,
      source,
      brand: brand === 'all' ? undefined : brand
    });
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSource('gami');
    setBrand('all');
    onFilter({});
  };

  return (
    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-medium">Lọc sản phẩm</h2>
      
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Thương hiệu</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            {BRANDS.map((brandItem) => (
              <option key={brandItem.id} value={brandItem.id}>
                {brandItem.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Khoảng giá</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Tối thiểu"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Tối đa"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Nguồn dữ liệu</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="gami">Gami (Ghế công thái học)</option>
            <option value="congthaihoc">CongThaiHoc.vn</option>
            <option value="dummyjson">DummyJSON API</option>
            <option value="fakestore">FakeStore API</option>
            <option value="all">Tất cả nguồn</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Sắp xếp theo</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp đến cao</option>
            <option value="price_desc">Giá: Cao đến thấp</option>
            <option value="name_asc">Tên: A-Z</option>
            <option value="name_desc">Tên: Z-A</option>
            <option value="discount">Giảm giá nhiều nhất</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleApplyFilter}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Áp dụng
          </button>
          <button
            onClick={handleReset}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
} 