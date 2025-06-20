import { useState, useEffect } from 'react';

interface SoldCountsData {
  [productId: string]: number;
}

interface UseSoldCountsReturn {
  soldCounts: SoldCountsData;
  loading: boolean;
  error: string | null;
  getSoldCount: (productId: string) => number;
}

// Cache để tránh fetch nhiều lần
let soldCountsCache: SoldCountsData | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export function useSoldCounts(productIds?: string[]): UseSoldCountsReturn {
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

      const url = ids && ids.length > 0 
        ? `/api/products/sold-counts?product_ids=${ids.join(',')}`
        : '/api/products/sold-counts';

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
      console.error('Error fetching sold counts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
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
    getSoldCount
  };
}

// Hook để clear cache khi cần
export function clearSoldCountsCache() {
  soldCountsCache = null;
  cacheTimestamp = null;
} 