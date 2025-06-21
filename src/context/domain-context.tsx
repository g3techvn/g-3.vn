'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sector } from '@/types';

interface DomainContextType {
  domain: string;
  sectorId: string | null;
  isLoading: boolean;
  error: string | null;
  isLocalhost: boolean;
}

const DomainContext = createContext<DomainContextType>({
  domain: '',
  sectorId: null,
  isLoading: true,
  error: null,
  isLocalhost: false,
});

export const useDomain = () => useContext(DomainContext);

// ✅ Persistent cache with localStorage
const DOMAIN_CACHE_KEY = 'g3_domain_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface DomainCache {
  domain: string;
  sectorId: string | null;
  timestamp: number;
}

// ✅ Cache utilities
const getDomainCache = (): DomainCache | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(DOMAIN_CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached) as DomainCache;
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - data.timestamp < CACHE_DURATION) {
      return data;
    }
    
    // Clean expired cache
    localStorage.removeItem(DOMAIN_CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading domain cache:', error);
    return null;
  }
};

const setDomainCache = (domain: string, sectorId: string | null) => {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheData: DomainCache = {
      domain,
      sectorId,
      timestamp: Date.now()
    };
    localStorage.setItem(DOMAIN_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error setting domain cache:', error);
  }
};

export function DomainProvider({ children }: { children: ReactNode }) {
  const [domain, setDomain] = useState<string>('');
  const [sectorId, setSectorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocalhost, setIsLocalhost] = useState<boolean>(false);

  useEffect(() => {
    const detectDomain = async () => {
      try {
        setIsLoading(true);
        
        // ✅ Check cache first
        const cachedData = getDomainCache();
        if (cachedData) {
          setDomain(cachedData.domain);
          setSectorId(cachedData.sectorId);
          setIsLoading(false);
          
          // ✅ Detect localhost status
          if (typeof window !== 'undefined') {
            const host = window.location.host;
            const hostname = host.split(':')[0];
            setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
          }
          
          return; // Use cached data
        }
        
        // ✅ Get domain from environment variable
        const currentDomain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
        setDomain(currentDomain);
        
        // ✅ Check localhost status
        if (typeof window !== 'undefined') {
        const host = window.location.host;
          const hostname = host.split(':')[0];
        const localhost = hostname === 'localhost' || hostname === '127.0.0.1';
        setIsLocalhost(localhost);
        }
        
        // ✅ Fetch sector with timeout and retry
        let sectorIdResult: string | null = null;
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
          
          const response = await fetch(`/api/sectors?title=${currentDomain}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
        const data = await response.json();
        if (data.sectors && data.sectors.length > 0) {
              sectorIdResult = data.sectors[0].id;
            }
        } else {
            console.warn(`Sector API returned ${response.status} for domain: ${currentDomain}`);
        }
        } catch (fetchError) {
          console.warn('Failed to fetch sector, using cached or default values:', fetchError);
          // Don't throw error, continue with null sector
        }
        
        setSectorId(sectorIdResult);
        
        // ✅ Cache the result
        setDomainCache(currentDomain, sectorIdResult);
        
      } catch (err) {
        console.error('Error in domain detection:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // ✅ Fallback to default values
        const fallbackDomain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
        setDomain(fallbackDomain);
        setSectorId(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    detectDomain();
  }, []);

  return (
    <DomainContext.Provider value={{ domain, sectorId, isLoading, error, isLocalhost }}>
      {children}
    </DomainContext.Provider>
  );
} 