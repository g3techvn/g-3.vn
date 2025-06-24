'use client';

import { useState } from 'react';
import { Product, Brand } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useDevice } from '@/components/common';
import DesktopHome from '@/components/pc/home/DesktopHome';
import MobileHome from '@/components/mobile/home/MobileHome';
import { FAQJsonLd } from '@/components/SEO/FAQJsonLd';
import { generalFAQs } from '@/lib/general-faqs';

export function HomeContent({
  brands,
  categories,
  comboProducts
}: {
  brands: Brand[];
  categories: any[];
  comboProducts: Product[];
}) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { isMobile } = useDevice();

  // Convert selected category slug to ID for API calls
  const selectedCategoryId = categories.find(
    cat => cat.slug === selectedCategory
  )?.id?.toString();

  // Mobile products (filtered by selected category)
  const { products: mobileFeatureProducts } = useProducts({ 
    type: 'mobilefeature',
    categoryId: selectedCategoryId
  });
  const { products: newProducts } = useProducts({ 
    type: 'new',
    categoryId: selectedCategoryId
  });

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
  };

  return (
    <div className="min-h-screen">
      {isMobile ? (
        <MobileHome
          categories={categories}
          onCategoryChange={handleCategoryChange}
          featureProducts={mobileFeatureProducts}
          newProducts={newProducts}
          brands={brands}
        />
      ) : (
        <DesktopHome
          newProducts={newProducts}
          brands={brands}
          comboProducts={comboProducts}
        />
      )}
      <FAQJsonLd faqs={generalFAQs} />
    </div>
  );
} 