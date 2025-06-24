import { Suspense } from 'react';
import { Product, Brand } from '@/types';
import { DeviceProvider, ErrorBoundary } from '@/components/common';
import { HomeContent } from '@/components/home/HomeContent';
import { createServerClient } from '@/lib/supabase';

// Move this to a separate service file later
async function fetchData() {
  try {
    // Khởi tạo Supabase client
    const supabase = createServerClient();

    // Fetch data directly from Supabase
    const [
      { data: brands, error: brandsError },
      { data: categories, error: categoriesError },
      { data: comboProducts, error: comboError }
    ] = await Promise.all([
      supabase.from('brands').select('*'),
      supabase.from('product_cats').select('*'),
      supabase.from('products')
        .select('*')
        .eq('feature', true)
        .eq('status', true)
        .limit(8)
    ]);

    if (brandsError) throw new Error('Failed to fetch brands');
    if (categoriesError) throw new Error('Failed to fetch categories');
    if (comboError) throw new Error('Failed to fetch combo products');

    const formattedCategories = [
      { name: 'Tất cả', slug: '', id: null, productCount: 0 },
      ...(categories || []).map((cat: any) => ({
        name: cat.title,
        slug: cat.slug,
        id: cat.id,
        productCount: cat.product_count || 0
      }))
    ];

    return {
      brands: brands || [],
      categories: formattedCategories,
      comboProducts: comboProducts || []
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export default async function HomePage() {
  const data = await fetchData();
  
  return (
    <ErrorBoundary>
      <DeviceProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <HomeContent 
            brands={data.brands}
            categories={data.categories}
            comboProducts={data.comboProducts}
          />
        </Suspense>
      </DeviceProvider>
    </ErrorBoundary>
  );
}
