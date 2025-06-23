'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';
import Image from 'next/image';
import { formatCurrency } from '@/utils/helpers';
import { useRouter } from 'next/navigation';

export interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchDrawer = ({ isOpen, onClose }: SearchDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { products, loading } = useProducts();
  const router = useRouter();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = products.filter((product) => {
      const name = product.name.toLowerCase();
      const description = product.description?.toLowerCase() || '';
      return name.includes(query) || description.includes(query);
    });

    setSearchResults(results);
  }, [searchQuery, products]);

  const handleProductClick = (productId: string) => {
    router.push(`/san-pham/${productId}`);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="top" className="w-full h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Tìm kiếm sản phẩm
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Nhập tên sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="relative aspect-square mb-4">
                      <Image
                        src={product.image_url || '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <h3 className="font-medium line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SearchDrawer; 