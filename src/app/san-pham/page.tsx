'use client';

import { useState, useEffect } from 'react';
import { Product, Brand } from '@/types';
import { SidebarFilter } from '@/components/store/sidebarfilter';
import { Breadcrumb } from '@/components/pc/common/Breadcrumb';
import { ProductCard } from '@/components/pc/product/ProductCard';
// Đã comment import vì hiện tại chưa sử dụng
// import { createBrowserClient } from '@/lib/supabase';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridView, setGridView] = useState<'4' | '5' | '6'>('5');
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [isOrderMenuOpen, setIsOrderMenuOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('price_desc');

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Đây là client component nên có thể sử dụng hoặc browser client hoặc API route
      // Phương án 1: Sử dụng API route (bảo trì đơn giản hơn)
      const url = '/api/products';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      let productsData = data.products || [];
      // Sắp xếp sản phẩm theo giá tăng dần
      productsData = productsData.sort((a: Product, b: Product) => a.price - b.price);
      setProducts(productsData);
      setFilteredProducts(productsData);
      
      // Tính giá trị sản phẩm đắt nhất và làm tròn lên hàng triệu
      if (productsData.length > 0) {
        let max = Math.max(...productsData.map((p: Product) => p.price));
        // Làm tròn lên hàng triệu gần nhất
        max = Math.ceil(max / 1000000) * 1000000;
        setMaxPrice(max);
        console.log(`Giá cao nhất: ${max.toLocaleString()} VND`);
      } else {
        // Nếu không có sản phẩm, đặt giá cao nhất mặc định là 10 triệu
        setMaxPrice(10000000);
      }
      
      console.log(`Nhận được ${productsData.length} sản phẩm từ API`);
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải sản phẩm');
      // Đặt giá mặc định nếu có lỗi
      setMaxPrice(10000000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch brands data
  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const url = '/api/brands';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched brands:', data.brands);
      setBrands(data.brands || []);
    } catch (error: unknown) {
      console.error('Error fetching brands:', error);
      setBrandError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải thương hiệu');
    } finally {
      setLoadingBrands(false);
    }
  };

  const handleFilterChange = (filters: {
    priceRange: { min: number; max: number };
    brandIds: number[];
    categoryIds: number[];
  }) => {
    const { priceRange, brandIds, categoryIds } = filters;
    
    const filtered = products.filter((product) => {
      const priceInRange = product.price >= priceRange.min && product.price <= priceRange.max;
      const brandMatch = brandIds.length === 0 || (product.brand_id && brandIds.includes(Number(product.brand_id)));
      const categoryMatch = categoryIds.length === 0 || (product.pd_cat_id && categoryIds.includes(Number(product.pd_cat_id)));
      return priceInRange && brandMatch && categoryMatch;
    });
    
    // Sắp xếp sản phẩm theo thứ tự hiện tại
    const sortedProducts = sortProducts(filtered, currentOrder);
    setFilteredProducts(sortedProducts);
  };

  const sortProducts = (products: Product[], order: typeof currentOrder) => {
    const sorted = [...products];
    switch (order) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      case 'name_desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
      default:
        return sorted;
    }
  };

  const handleOrderChange = (order: typeof currentOrder) => {
    setCurrentOrder(order);
    setFilteredProducts(prev => sortProducts(prev, order));
    setIsOrderMenuOpen(false);
  };

  // Add debug logging
  useEffect(() => {
    if (brands.length > 0) {
      console.log("Ready to render with brands:", brands.length);
      console.log("Sample brand data:", brands[0]);
    }
  }, [brands]);

  useEffect(() => {
    fetchProducts();
    fetchBrands(); // Fetch brands on component mount
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-6">
        {/* Sidebar Filter */}
        <div className="md:col-span-1">
          <SidebarFilter 
            onFilterChange={handleFilterChange}
            maxPrice={maxPrice}
            products={products}
          />
        </div>

        {/* Products Grid */}
        <div className="md:col-span-5">
          {error && (
            <div className="mb-8 rounded-md bg-red-50 p-4 text-red-600">
              Đã xảy ra lỗi: {error}
            </div>
          )}

          <div className="bg-white rounded-lg mb-6">
            <div className="flex items-center justify-between h-[56px] px-4">
              <Breadcrumb
                items={[
                  { label: 'Trang chủ', href: '/' },
                  { label: 'Sản phẩm' }
                ]}
              />
              <div className="flex items-center space-x-4">
                {/* Order Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsOrderMenuOpen(!isOrderMenuOpen)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                  >
                    <span className="text-sm">
                      {currentOrder === 'price_asc' && 'Giá tăng dần'}
                      {currentOrder === 'price_desc' && 'Giá giảm dần'}
                      {currentOrder === 'name_asc' && 'Tên A-Z'}
                      {currentOrder === 'name_desc' && 'Tên Z-A'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {isOrderMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <button
                          onClick={() => handleOrderChange('price_asc')}
                          className={`block px-4 py-2 text-sm w-full text-left ${currentOrder === 'price_asc' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                          role="menuitem"
                        >
                          Giá tăng dần
                        </button>
                        <button
                          onClick={() => handleOrderChange('price_desc')}
                          className={`block px-4 py-2 text-sm w-full text-left ${currentOrder === 'price_desc' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                          role="menuitem"
                        >
                          Giá giảm dần
                        </button>
                        <button
                          onClick={() => handleOrderChange('name_asc')}
                          className={`block px-4 py-2 text-sm w-full text-left ${currentOrder === 'name_asc' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                          role="menuitem"
                        >
                          Tên A-Z
                        </button>
                        <button
                          onClick={() => handleOrderChange('name_desc')}
                          className={`block px-4 py-2 text-sm w-full text-left ${currentOrder === 'name_desc' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} hover:bg-gray-100`}
                          role="menuitem"
                        >
                          Tên Z-A
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Grid View Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setGridView('4')}
                    className={`p-2 rounded-md ${
                      gridView === '4' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    aria-label="4 sản phẩm mỗi hàng"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setGridView('5')}
                    className={`p-2 rounded-md ${
                      gridView === '5' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    aria-label="5 sản phẩm mỗi hàng"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM17 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setGridView('6')}
                    className={`p-2 rounded-md ${
                      gridView === '6' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    }`}
                    aria-label="6 sản phẩm mỗi hàng"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM17 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM17 11a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${gridView === '4' ? 'md:grid-cols-4' : gridView === '5' ? 'md:grid-cols-5' : 'md:grid-cols-6'}`}>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square w-full rounded-lg bg-gray-200" />
                  <div className="mt-2 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${gridView === '4' ? 'md:grid-cols-4' : gridView === '5' ? 'md:grid-cols-5' : 'md:grid-cols-6'}`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-lg text-gray-600">Không tìm thấy sản phẩm nào.</p>
              <p className="mt-2 text-sm text-gray-500">Vui lòng thử lại với bộ lọc khác.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}