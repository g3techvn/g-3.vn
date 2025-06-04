'use client';

import Image from 'next/image';
import { useState, useEffect, ChangeEvent, useMemo, useCallback } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Search, AlertCircle, Star } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import debounce from 'lodash/debounce';

interface ProductSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to normalize Vietnamese text
const normalizeVietnameseText = (text: string) => {
  return text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd');
};

export default function ProductSelectionModal({ isOpen, onOpenChange }: ProductSelectionModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Get unique brands from products
  const brands = useMemo(() => {
    const uniqueBrands = Array.from(new Set(products.map(product => product.brand).filter((brand): brand is string => brand !== null && brand !== undefined)));
    return uniqueBrands.sort();
  }, [products]);

  // Debounced search handler
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => {
      setDebouncedSearchQuery(value);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  // Fetch products for the modal
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setError(null);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Retry fetching products
  const handleRetry = () => {
    fetchProducts();
  };

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isOpen, products.length]);

  // Filter products based on search and selected brand
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = normalizeVietnameseText(product.name.toLowerCase())
        .includes(normalizeVietnameseText(debouncedSearchQuery.toLowerCase()));
      const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
      return matchesSearch && matchesBrand;
    });
  }, [products, debouncedSearchQuery, selectedBrand]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        />
      )}
      <DialogContent 
        className="max-w-4xl" 
        style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          zIndex: 1001,
          backgroundColor: 'white',
          padding: '1.5rem',
          width: '1200px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Chọn sản phẩm</DialogTitle>
            <button onClick={() => onOpenChange(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          {/* Brand filter buttons */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`rounded-full px-4 py-1 text-sm ${
                    selectedBrand === brand ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedBrand(null)}
              className={`rounded-full px-4 py-1 text-sm ${
                selectedBrand === null ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Tất cả
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4">
          {loadingProducts ? (
            // Loading skeleton
            <div className="grid grid-cols-4 gap-4 p-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex animate-pulse flex-col gap-2 rounded-lg border p-2">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200" />
                  <div className="flex flex-col gap-1">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-center text-sm text-gray-500">{error}</p>
              <button
                onClick={handleRetry}
                className="rounded-md bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary/90"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex cursor-pointer flex-col gap-2 rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                    onClick={() => {
                      addToCart(product);
                      onOpenChange(false);
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={product.image_url || 'https://via.placeholder.com/200'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                    <div className="flex flex-col gap-1 px-2 pb-2">
                      <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-xs text-gray-600">{product.rating || 0}</span>
                        </div>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-600">Đã bán {product.sold_count || 0}</span>
                      </div>
                      <div className="mt-1">
                        {product.original_price && product.original_price > product.price && (
                          <div className="text-xs text-gray-500 line-through">
                            {product.original_price.toLocaleString()}đ
                          </div>
                        )}
                        <div className="text-sm font-medium text-red-600">{product.price.toLocaleString()}đ</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                  <p className="text-center text-sm text-gray-500">
                    Không tìm thấy sản phẩm phù hợp
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 