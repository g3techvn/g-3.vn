import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  products: Product[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, products }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    );
    setSearchResults(filtered);
    setShowResults(true);

    if (onSearch) {
      onSearch(query);
    }
  };

  const handleProductClick = (product: Product) => {
    setShowResults(false);
    setSearchQuery('');
    router.push(`/san-pham/${product.slug || product.id}`);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Nhập từ khóa tìm sản phẩm..."
          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-[60vh] overflow-y-auto z-50">
          <div className="p-2">
            {searchResults.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="w-12 h-12 relative flex-shrink-0">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-red-600 font-semibold">
                      {product.price.toLocaleString()}₫
                    </div>
                    {product.original_price && product.original_price > product.price && (
                      <div className="text-xs text-gray-400 line-through">
                        {product.original_price.toLocaleString()}₫
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showResults && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-4 text-center text-gray-500 z-50">
          Không tìm thấy sản phẩm nào
        </div>
      )}
    </div>
  );
};

export default SearchBar; 