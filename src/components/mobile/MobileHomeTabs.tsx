import React, { useState, useEffect } from 'react';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';

interface Category {
  name: string;
  slug: string;
  productCount: number;
}

interface MobileHomeTabsProps {
  categories?: Category[];
  loading?: boolean;
  onCategoryChange?: (categorySlug: string) => void;
}

const MobileHomeTabs: React.FC<MobileHomeTabsProps> = ({ 
  categories = [], 
  loading = false,
  onCategoryChange 
}) => {
  const [active, setActive] = useState(0);
  const isVisible = useHeaderVisibility();

  // Khi categories thay đổi, gọi callback với category đầu tiên
  useEffect(() => {
    if (categories.length > 0 && onCategoryChange) {
      onCategoryChange(categories[0].slug);
    }
  }, [categories, onCategoryChange]);

  const handleTabClick = (idx: number, slug: string) => {
    setActive(idx);
    if (onCategoryChange) {
      onCategoryChange(slug);
    }
  };

  // Nếu không có danh mục hoặc chỉ có 1 danh mục, không hiển thị tabs
  if (categories.length < 2) {
    return null;
  }

  if (loading) {
    return (
      <div className={`flex overflow-x-auto border-b border-gray-200 bg-white sticky z-20 transition-all duration-200 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
        isVisible ? 'top-[48px]' : 'top-0'
      }`}>
        {[1, 2, 3, 4].map((_, idx) => (
          <div
            key={idx}
            className="flex-1 px-4 py-2 whitespace-nowrap"
          >
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex overflow-x-auto border-b border-gray-200 bg-white sticky z-20 transition-all duration-200 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
      isVisible ? 'top-[48px]' : 'top-0'
    }`}>
      {categories.map((cat, idx) => (
        <button
          key={cat.slug}
          className={`flex-1 px-4 py-2 whitespace-nowrap text-sm font-medium transition-colors ${active === idx ? 'text-red-600 border-b-2 border-red-600 ' : 'text-gray-700'}`}
          onClick={() => handleTabClick(idx, cat.slug)}
        >
          {cat.name}
          {/* {cat.productCount > 0 && (
            <span className="ml-1 text-xs text-gray-500">({cat.productCount})</span>
          )} */}
        </button>
      ))}
    </div>
  );
};

export default MobileHomeTabs; 