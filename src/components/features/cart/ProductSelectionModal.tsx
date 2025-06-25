'use client';

import * as React from 'react';
import Image from 'next/image';
import { useState, useEffect, ChangeEvent, useMemo, useCallback } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, Search, AlertCircle, Star } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Dialog as BaseDialog, DialogContent as BaseDialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/utils/cn';
import debounce from 'lodash/debounce';

// Custom Dialog components with higher z-index
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[99998] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-[99999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

const Dialog = BaseDialog;

interface ProductSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Category {
  id: number;
  title: string;
  slug: string;
  product_count: number;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addToCart } = useCart();
  
  // Remove useSoldCounts hook and its usage
  const productIds = products.map(p => p.id.toString());

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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data.product_cats || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen) {
      if (products.length === 0) {
        fetchProducts();
      }
      if (categories.length === 0) {
        fetchCategories();
      }
    }
  }, [isOpen, products.length, categories.length]);

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(null);
      setSelectedBrand(null);
      setSearchQuery('');
      setDebouncedSearchQuery('');
    }
  }, [isOpen]);

  // Filter products based on search, selected brand and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Luôn kiểm tra điều kiện tìm kiếm
      const matchesSearch = normalizeVietnameseText(product.name.toLowerCase())
        .includes(normalizeVietnameseText(debouncedSearchQuery.toLowerCase()));

      // Nếu không chọn gì thì hiển thị tất cả sản phẩm thỏa mãn điều kiện tìm kiếm
      if (!selectedCategory && !selectedBrand) {
        return matchesSearch;
      }

      // Nếu chọn danh mục, lọc theo danh mục
      const matchesCategory = selectedCategory 
        ? product.pd_cat_id?.toString() === selectedCategory
        : true;

      // Nếu chọn brand, lọc theo brand
      const matchesBrand = selectedBrand 
        ? (typeof product.brand === 'string' ? product.brand : product.brand?.title) === selectedBrand 
        : true;

      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [products, debouncedSearchQuery, selectedBrand, selectedCategory]);

  // Handle adding product to cart
  const handleAddToCart = async (product: Product) => {
    try {
      // Create cart item with proper structure
      const cartItem = {
        productId: product.id,
        quantity: 1,
        product: {
          ...product,
          // Ensure variants are properly handled
          variants: product.variants || []
        }
      };
      
      await addToCart(cartItem);
      // Close modal after successful add
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      setError('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] md:max-h-[80vh] flex flex-col p-4 md:p-6"
        style={{ 
          width: '100%',
          maxWidth: '90vw',
        }}
      >
        <DialogHeader className="flex-shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg md:text-xl">Chọn sản phẩm</DialogTitle>
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
          {/* Category filter buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-wrap gap-1.5 md:gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  className={`rounded-full px-3 py-1 text-xs md:text-sm md:px-4 ${
                    selectedCategory === category.id.toString() ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {category.title} ({category.product_count})
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs md:text-sm md:px-4 ${
                selectedCategory === null ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="hidden md:inline">Tất cả danh mục</span>
              <span className="md:hidden">Tất cả</span>
            </button>
          </div>
          {/* Brand filter buttons */}
          <div className="flex items-center justify-between gap-2 mt-1 md:mt-2">
            <div className="flex-1 flex flex-wrap gap-1.5 md:gap-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`rounded-full px-3 py-1 text-xs md:text-sm md:px-4 ${
                    selectedBrand === brand ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedBrand(null)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs md:text-sm md:px-4 ${
                selectedBrand === null ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="hidden md:inline">Tất cả thương hiệu</span>
              <span className="md:hidden">Tất cả</span>
            </button>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-4 text-red-600 bg-red-50 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
            <button
              onClick={handleRetry}
              className="ml-auto text-sm font-medium hover:underline"
            >
              Thử lại
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto mt-4">
          {loadingProducts ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative group bg-white rounded-lg border p-2 hover:border-red-600 transition-colors"
                >
                  <div className="relative aspect-square mb-2">
                    <Image
                      src={product.image_url || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating || 5}</span>
                    </div>
                    <p className="text-sm font-medium text-red-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(product.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white font-medium">Thêm vào giỏ</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 