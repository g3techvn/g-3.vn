'use client';

import dynamic from 'next/dynamic';

// ✅ Dynamic imports for admin components - bundle optimization
export const DynamicImageGallery = dynamic(
  () => import('@/components/storage/ImageGallery').then(mod => ({ default: mod.ImageGallery })),
  {
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang tải Image Gallery...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

export const DynamicLocationManager = dynamic(
  () => import('@/components/admin/LocationManager'),
  {
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang tải Location Manager...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

export const DynamicSoldCountTest = dynamic(
  () => import('@/components/admin/SoldCountOptimizationTest'),
  {
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang tải Sold Count Test...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

export const DynamicRewardPointsHistory = dynamic(
  () => import('@/components/features/rewards/RewardPointsHistory'),
  {
    loading: () => (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    ),
    ssr: false
  }
); 