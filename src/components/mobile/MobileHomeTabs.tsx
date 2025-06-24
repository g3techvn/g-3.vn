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
  onCategoryChange 
}) => {
  const [active, setActive] = useState(0);
  const isVisible = useHeaderVisibility();
  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (categories.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setActive(0);
    }
  }, [categories]);

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
        </button>
      ))}
    </div>
  );
};

export default MobileHomeTabs; 