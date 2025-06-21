import { useState, useEffect } from 'react';

interface SoldCountsData {
  [productId: string]: number;
}

interface UseSoldCountsReturn {
  soldCounts: SoldCountsData;
  loading: boolean;
  error: string | null;
  getSoldCount: (productId: string) => number;
  refreshSoldCounts: (productIds?: string[]) => Promise<void>;
}

// Longer cache duration since we have auto-updating triggers
let soldCountsCache: SoldCountsData | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function useSoldCountsOptimized(productIds?: string[]): UseSoldCountsReturn {
  const [soldCounts, setSoldCounts] = useState<SoldCountsData>(soldCountsCache || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSoldCounts = async (ids?: string[]) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const now = Date.now();
      if (soldCountsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
        setSoldCounts(soldCountsCache);
        setLoading(false);
        return;
      }

      // Use optimized endpoint
      const url = ids && ids.length > 0 
        ? `/api/products/sold-counts-optimized?product_ids=${ids.join(',')}`
        : '/api/products/sold-counts-optimized';

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch sold counts');
      }

      // Update cache
      soldCountsCache = data.soldCounts;
      cacheTimestamp = now;
      
      setSoldCounts(data.soldCounts);
    } catch (err) {
      console.error('Error fetching optimized sold counts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh sold counts
  const refreshSoldCounts = async (refreshProductIds?: string[]) => {
    if (refreshProductIds && refreshProductIds.length > 0) {
      // Trigger manual update via POST endpoint
      try {
        await fetch('/api/products/sold-counts-optimized', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productIds: refreshProductIds }),
        });
      } catch (err) {
        console.error('Error refreshing sold counts:', err);
      }
    }
    
    // Clear cache and refetch
    soldCountsCache = null;
    cacheTimestamp = null;
    await fetchSoldCounts(productIds);
  };

  useEffect(() => {
    fetchSoldCounts(productIds);
  }, [productIds?.join(',')]); // Re-fetch when product IDs change

  const getSoldCount = (productId: string): number => {
    return soldCounts[productId] || 0;
  };

  return {
    soldCounts,
    loading,
    error,
    getSoldCount,
    refreshSoldCounts
  };
}

// Hook để clear cache khi cần
export function clearSoldCountsOptimizedCache() {
  soldCountsCache = null;
  cacheTimestamp = null;
}

// Hook để get sold count cho single product (không cần array)
export function useSingleProductSoldCount(productId: string) {
  const { getSoldCount, loading, error } = useSoldCountsOptimized([productId]);
  
  return {
    soldCount: getSoldCount(productId),
    loading,
    error
  };
} 