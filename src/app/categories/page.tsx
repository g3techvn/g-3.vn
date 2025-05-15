'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link
// import { Brand } from '@/types'; // Will replace this
import MobileCatogeryFeature from '@/components/mobile/MobileCatogeryFeature';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import MobileLayout from '@/components/mobile/MobileLayout';

// Define ProductCat interface
interface ProductCat {
  id: number | string;
  title: string;
  description?: string; // Assuming it might have a description
  slug: string; // Added slug field
}

export default function CategoriesPage() { // Renamed from BrandsPage for clarity
  const [productCats, setProductCats] = useState<ProductCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductCats = async () => { // Renamed from fetchBrands
    try {
      setLoading(true);
      const url = '/api/categories'; // Changed from /api/brands
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setProductCats(data.product_cats || []); // Expecting product_cats array
    } catch (error: unknown) {
      console.error('Error fetching product categories:', error); // Updated error message
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải danh mục sản phẩm'); // Updated error message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductCats(); // Call the renamed function
  }, []);

  // Mobile View
  const MobileView = () => (
    <div className="md:hidden">
      <MobileHomeHeader />
      <div className="px-4 py-4">
        <MobileCatogeryFeature />
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-600">
            Đã xảy ra lỗi: {error}
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full rounded-lg bg-gray-200" />
                <div className="mt-2 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : productCats.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {productCats.map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`} className="block">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm h-full flex flex-col">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                    <div className="flex h-full items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">
                        {category.title.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.title}
                    </h3>
                    {category.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-base text-gray-600">Không tìm thấy danh mục sản phẩm nào.</p> {/* Updated message */}
          </div>
        )}
      </div>
    </div>
  );

  // Desktop View
  const DesktopView = () => (
    <div className="hidden md:block container mx-auto px-2 py-4">
      <h1 className="mb-4 text-2xl font-bold">Danh mục sản phẩm</h1> {/* Updated title */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-red-600">
          Đã xảy ra lỗi: {error}
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square w-full rounded-lg bg-gray-200" />
              <div className="mt-2 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : productCats.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-5">
          {productCats.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="block">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm h-full flex flex-col">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-2xl font-bold text-gray-400">
                      {category.title.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.title}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-base text-gray-600">Không tìm thấy danh mục sản phẩm nào.</p> {/* Updated message */}
        </div>
      )}
    </div>
  );

  return (
    <>
      <MobileLayout>
        <MobileView />
      </MobileLayout>
      <DesktopView />
    </>
  );
}
