'use client';

import { useState, useEffect } from 'react';
import { Brand } from '@/types';
import MobileCatogeryFeature from '@/components/mobile/MobileCatogeryFeature';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import MobileLayout from '@/components/mobile/MobileLayout';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const url = '/api/brands';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error: unknown) {
      console.error('Error fetching brands:', error);
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
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
        ) : brands.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {brands.map((brand) => (
              <div key={brand.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-2xl font-bold text-gray-400">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {brand.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {brand.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-base text-gray-600">Không tìm thấy thương hiệu nào.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop View
  const DesktopView = () => (
    <div className="hidden md:block container mx-auto px-2 py-4">
      <h1 className="mb-4 text-2xl font-bold">Thương hiệu</h1>
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
      ) : brands.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-5">
          {brands.map((brand) => (
            <div key={brand.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                <div className="flex h-full items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">
                    {brand.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {brand.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {brand.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-base text-gray-600">Không tìm thấy thương hiệu nào.</p>
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
