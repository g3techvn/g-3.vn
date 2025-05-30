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
        
        // Get the domain from environment variable instead of window.location
        const currentDomain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
        setDomain(currentDomain);
        
        // Check if we're on localhost (just for information, no longer affects sector fetching)
        const host = window.location.host;
        const hostname = host.split(':')[0]; // Remove port if present
        const localhost = hostname === 'localhost' || hostname === '127.0.0.1';
        setIsLocalhost(localhost);
        
        // Fetch the sector ID for this domain - always fetch regardless of localhost
        const response = await fetch(`/api/sectors?title=${currentDomain}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching sector: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.sectors && data.sectors.length > 0) {
          setSectorId(data.sectors[0].id);
        } else {
          console.warn(`No sector found for domain: ${currentDomain}`);
        }
      } catch (err) {
        console.error('Error in domain detection:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
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