import { Suspense } from 'react';
import { Product, Brand } from '@/types';
import { DeviceProvider, ErrorBoundary } from '@/components/common';
import { HomeContent } from '@/components/home/HomeContent';
import { createServerClient } from '@/lib/supabase';
import { SocialMetaTags } from '@/components/SEO/SocialMetaTags';
import { OrganizationJsonLd } from '@/components/SEO/OrganizationJsonLd';

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
    <>
      <SocialMetaTags
        title="G3.vn - Nội thất công thái học, ghế công thái học, bàn nâng hạ, bàn làm việc chuẩn Ergonomic"
        description="G3.vn - Chuyên nội thất công thái học, ghế công thái học, bàn nâng hạ, bàn làm việc chuẩn Ergonomic. Bảo hành 12 tháng, giao hàng toàn quốc, tư vấn miễn phí."
        image={`${process.env.NEXT_PUBLIC_SITE_URL}/images/header-img.jpg`}
        url={process.env.NEXT_PUBLIC_SITE_URL}
        type="website"
      />
      <OrganizationJsonLd />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "G3.vn",
            "url": process.env.NEXT_PUBLIC_SITE_URL,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
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
    </>
  );
}
