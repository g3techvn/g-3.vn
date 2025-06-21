import { useQuery } from '@tanstack/react-query';
import { Brand } from '@/types';

// Brand data cache với React Query
export const useBrandData = (brandId: string | number | null | undefined) => {
  return useQuery({
    queryKey: ['brand', brandId],
    queryFn: async (): Promise<Brand | null> => {
      if (!brandId) return null;
      
      try {
        const response = await fetch(`/api/brands/id/${brandId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.brand || null;
      } catch (error) {
        console.error('Error fetching brand data:', error);
        return null;
      }
    },
    enabled: !!brandId, // Only run if brandId exists
    staleTime: 10 * 60 * 1000, // 10 minutes - brands don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer (renamed from cacheTime in TanStack Query v5)
    retry: 2, // Retry failed requests
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
};

// Bulk brand data fetch for multiple brand IDs
export const useBrandsData = (brandIds: (string | number)[]) => {
  return useQuery({
    queryKey: ['brands', ...brandIds.sort()], // Sort for consistent cache key
    queryFn: async (): Promise<Record<string, Brand>> => {
      if (brandIds.length === 0) return {};
      
      try {
        // Fetch all brands in parallel
        const promises = brandIds.map(async (id) => {
          const response = await fetch(`/api/brands/id/${id}`);
          if (!response.ok) return null;
          const data = await response.json();
          return { id: String(id), brand: data.brand };
        });
        
        const results = await Promise.all(promises);
        
        // Convert to record format
        const brandsRecord: Record<string, Brand> = {};
        results.forEach((result) => {
          if (result && result.brand) {
            brandsRecord[result.id] = result.brand;
          }
        });
        
        return brandsRecord;
      } catch (error) {
        console.error('Error fetching brands data:', error);
        return {};
      }
    },
    enabled: brandIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime in TanStack Query v5)
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Pre-load common brands
export const usePreloadBrands = () => {
  const commonBrandIds = ['1', '2', '3', '4', '5']; // Most used brand IDs
  
  return useBrandsData(commonBrandIds);
}; 