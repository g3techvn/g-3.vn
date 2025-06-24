'use client';

// Direct imports instead of dynamic imports
import { ImageGallery } from '@/components/storage/ImageGallery';
import LocationManager from '@/components/admin/LocationManager';
import SoldCountOptimizationTest from '@/components/admin/SoldCountOptimizationTest';
import RewardPointsHistory from '@/components/features/rewards/RewardPointsHistory';

// Export components directly
export { ImageGallery as DynamicImageGallery };
export { LocationManager as DynamicLocationManager };
export { SoldCountOptimizationTest as DynamicSoldCountTest };
export { RewardPointsHistory as DynamicRewardPointsHistory }; 