import Image from 'next/image';
import { useState, useEffect, ChangeEvent, useMemo, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import debounce from 'lodash/debounce';

interface ProductSelectionDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelect?: (product: Product) => void;
}

// Helper function to normalize Vietnamese text
const normalizeVietnameseText = (text: string) => {
  return text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd');
};

export default function ProductSelectionDrawer({ isOpen, onOpenChange, onProductSelect }: ProductSelectionDrawerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Get unique brands from products
  const brands = useMemo(() => {
    const brandNames = products
      .map(product => typeof product.brand === 'string' ? product.brand : product.brand?.title)
      .filter((brand): brand is string => brand !== null && brand !== undefined);
    const uniqueBrands = Array.from(new Set(brandNames));
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

  // Fetch products for the drawer
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

  // Fetch products when drawer opens
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
      const matchesBrand = selectedBrand ? (typeof product.brand === 'string' ? product.brand : product.brand?.title) === selectedBrand : true;
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
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="sticky top-0 z-10 bg-white pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Chọn sản phẩm</SheetTitle>
            <button onClick={() => onOpenChange(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative">
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
        </SheetHeader>

        {loadingProducts ? (
          // Loading state
          <div className="grid grid-cols-2 gap-4 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
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
            <div className="grid rounded-lg bg-white px-4 grid-cols-2 gap-4 pt-4 ">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex cursor-pointer pb-2 shadow-md rounded-lg flex-col gap-2  bg-gray-100 "
                  onClick={() => {
                    if (onProductSelect) onProductSelect(product);
                    onOpenChange(false);
                  }}
                >
                  <div className="relative  aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={product.image_url || 'https://via.placeholder.com/200'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                  <div className="flex flex-col px-2 gap-1">
                    <p className="line-clamp-2  text-sm font-medium">{product.name}</p>
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
      </SheetContent>
    </Sheet>
  );
} 