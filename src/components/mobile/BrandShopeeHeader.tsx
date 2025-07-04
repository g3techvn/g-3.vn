import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { COMPANY_INFO } from '@/constants';

interface BrandShopeeHeaderProps {
  brandName: string;
  avatarUrl?: string;
  coverUrl?: string;
  followers?: number;
  rating?: number;
  onSearch?: (query: string) => void;
  products: Product[];
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

const BrandShopeeHeader: React.FC<BrandShopeeHeaderProps> = ({
  brandName,
  avatarUrl = '/images/g3-avatar.jpg',
  coverUrl = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
  followers = 16800,
  rating = 4.9,
  onSearch,
  products,
  activeTab,
  onTabChange,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const [tabsPlaceholderHeight, setTabsPlaceholderHeight] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabsInitialOffsetTopRef = useRef(0);

  const totalSold = React.useMemo(() => {
    return products.reduce((sum) => sum + Math.floor(Math.random() * 100 + 1), 0);
  }, [products]);

  const averageRating = React.useMemo(() => {
    if (products.length === 0) {
      return 0;
    }
    const sumOfRatings = products.reduce((sum, product) => sum + (product.rating || 4.9), 0);
    return sumOfRatings / products.length;
  }, [products]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const tabsElement = tabsRef.current;
    if (!tabsElement) return;

    tabsInitialOffsetTopRef.current = tabsElement.getBoundingClientRect().top + window.scrollY;
    setTabsPlaceholderHeight(tabsElement.offsetHeight);

    const handleScroll = () => {
      // Ensure tabsRef.current is still valid within the handler
      if (!tabsRef.current) return; 
      
      const scrollY = window.scrollY;
      if (scrollY >= tabsInitialOffsetTopRef.current) {
        setIsTabsSticky(true);
      } else {
        setIsTabsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check in case the page loads already scrolled
    handleScroll(); 

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array to run once on mount and clean up on unmount

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
  };

  const handleProductClick = (product: Product) => {
    setShowResults(false);
    setSearchQuery('');
    router.push(`/san-pham/${product.slug || product.id}`);
  };

  return (
    <div className="relative pb-4">
      {/* Ảnh nền mờ */}
      <div className="absolute inset-0 h-56 w-full z-0">
        <Image
          src={coverUrl}
          alt="cover"
          fill
          priority
          quality={90}
          className="object-cover w-full h-full"
        />
      </div>
      {/* Thanh tìm kiếm + back */}
      <div className="relative z-20 flex items-center px-4 pt-4">
        <button
          onClick={() => router.push('/brands')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow mr-3"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <div ref={searchRef} className="flex-1 relative">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-full pl-10 pr-3 py-2.5 bg-white/90 shadow text-sm placeholder-gray-400"
              placeholder="Tìm kiếm sản phẩm trong Shop"
            />
          </div>
          
          {/* Search Results Modal */}
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
                        src={product.image_url || '/placeholder-product.jpg'}
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
      </div>
      {/* Thông tin shop */}
      <div className="relative z-10 flex items-center px-4 mt-10">
        <div className="w-16 h-16 rounded-full border-4 border-white shadow overflow-hidden bg-white">
          <Image src={avatarUrl} alt={brandName} width={80} height={80} className="object-cover w-full h-full" />
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white drop-shadow line-clamp-1">{brandName}</span>
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">Mall</span>
          </div>
          <div className="text-white text-sm mt-2 drop-shadow">{averageRating.toFixed(1)} <span className="text-yellow-400">★</span> | {totalSold.toLocaleString()} đơn hàng đã bán</div>
        </div>
        <div className="flex flex-col gap-2 ml-2">
          <button 
            className="bg-red-600 text-white rounded px-4 py-1.5 text-sm font-semibold"
            onClick={() => window.location.href = `tel:${COMPANY_INFO.hotline}`}
          >
            Liên hệ
          </button>
          <button 
            className="bg-white text-red-600 rounded px-4 py-1.5 text-sm font-semibold border border-red-600"
            onClick={() => router.push('/nhan-tin')}
          >
            Chat
          </button>
        </div>
      </div>
      {/* Video của Shop row */}
      <div className="relative z-10 flex items-center justify-between px-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
          <span className="text-white text-sm drop-shadow">Video của Shop</span>
        </div>
        <span className="text-white/90 text-sm drop-shadow">185 Video</span>
      </div>
      {/* Tabs */}
      <div className="mt-4"> {/* Wrapper to handle original margin */}
        {isTabsSticky && <div style={{ height: `${tabsPlaceholderHeight}px` }} />}
        <div
          ref={tabsRef}
          className={`flex text-base font-semibold border-b border-gray-200 bg-white ${
            isTabsSticky 
            ? 'fixed top-0 left-0 right-0 z-40 shadow-md' 
            : '' 
          }`}
        >
          {['Sản phẩm', 'Danh mục', 'Video'].map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex-1 py-3 text-center font-semibold ${activeTab === tab ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandShopeeHeader; 