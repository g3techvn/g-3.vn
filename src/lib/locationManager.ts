import { Province, District, Ward, LocationData } from './provinces';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface LocationCache extends LocationData {
  lastUpdated: string;
  version: string;
}

export interface LocationManagerConfig {
  cacheKey: string;
  version: string;
  maxAge: number; // in milliseconds
  retryAttempts: number;
  retryDelay: number; // in milliseconds
}

class LocationManagerService {
  private config: LocationManagerConfig = {
    cacheKey: 'g3_location_data',
    version: '1.0',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  };

  private cache: LocationCache | null = null;
  private loadingPromise: Promise<void> | null = null;
  private lastError: Error | null = null;

  constructor(config?: Partial<LocationManagerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadFromStorage();
  }

  async loadFromStorage(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.config.cacheKey);
      if (stored) {
        const data = JSON.parse(stored) as LocationCache;
        
        if (!this.isValidCache(data)) {
          throw new Error('Invalid cache structure');
        }
        
        const age = Date.now() - new Date(data.lastUpdated).getTime();
        if (data.version === this.config.version && age < this.config.maxAge) {
          this.cache = data;
          this.lastError = null;
        } else {
          this.clearCache();
          await this.reloadDataWithRetry();
        }
      } else {
        await this.reloadDataWithRetry();
      }
    } catch (error) {
      console.error('Error loading location cache:', error);
      this.lastError = error as Error;
      this.clearCache();
      await this.reloadDataWithRetry();
    }
  }

  private isValidCache(data: any): data is LocationCache {
    return (
      data &&
      Array.isArray(data.provinces) &&
      Array.isArray(data.districts) &&
      Array.isArray(data.wards) &&
      typeof data.lastUpdated === 'string' &&
      typeof data.version === 'string'
    );
  }

  private async reloadDataWithRetry(attempt = 1): Promise<void> {
    try {
      if (this.loadingPromise) {
        return this.loadingPromise;
      }

      this.loadingPromise = new Promise(async (resolve, reject) => {
        try {
          // Fetch provinces
          const { data: provinces, error: provincesError } = await supabase
            .from('provinces')
            .select('*')
            .order('name');

          if (provincesError) throw provincesError;

          // Fetch districts
          const { data: districts, error: districtsError } = await supabase
            .from('districts')
            .select('*')
            .order('name');

          if (districtsError) throw districtsError;

          // Fetch wards
          const { data: wards, error: wardsError } = await supabase
            .from('wards')
            .select('*')
            .order('name');

          if (wardsError) throw wardsError;

          this.updateCache({
            provinces: provinces || [],
            districts: districts || [],
            wards: wards || []
          });
          
          this.lastError = null;
          resolve();
        } catch (error) {
          console.error(`Error reloading location data (attempt ${attempt}):`, error);
          
          if (attempt < this.config.retryAttempts) {
            await new Promise(r => setTimeout(r, this.config.retryDelay));
            await this.reloadDataWithRetry(attempt + 1);
            resolve();
          } else {
            this.lastError = error as Error;
            reject(error);
          }
        } finally {
          this.loadingPromise = null;
        }
      });

      return this.loadingPromise;
    } catch (error) {
      console.error('Final error in reloadDataWithRetry:', error);
      this.lastError = error as Error;
      throw error;
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined' || !this.cache) return;

    try {
      localStorage.setItem(this.config.cacheKey, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Error saving location cache:', error);
    }
  }

  // Get cached data with validation
  getProvinces(): Province[] {
    if (!this.cache) {
      this.loadFromStorage();
      return [];
    }
    return this.cache.provinces;
  }

  getDistricts(provinceCode?: number): District[] {
    if (!this.cache) {
      this.loadFromStorage();
      return [];
    }
    const districts = this.cache.districts;
    return provinceCode ? districts.filter(d => d.province_code === provinceCode) : districts;
  }

  getWards(districtCode?: number): Ward[] {
    if (!this.cache) {
      this.loadFromStorage();
      return [];
    }
    const wards = this.cache.wards;
    return districtCode ? wards.filter(w => w.district_code === districtCode) : wards;
  }

  // Find methods with proper return types
  findProvinceByCode(code: number): Province | undefined {
    const provinces = this.getProvinces();
    return provinces.find(p => p.code === code);
  }

  findProvinceByName(name: string): Province | undefined {
    const provinces = this.getProvinces();
    return provinces.find(p => 
      p.name.toLowerCase().includes(name.toLowerCase()) ||
      p.codename.toLowerCase().includes(name.toLowerCase())
    );
  }

  findDistrictByCode(code: number): District | undefined {
    const districts = this.getDistricts();
    return districts.find(d => d.code === code);
  }

  findWardByCode(code: number): Ward | undefined {
    const wards = this.getWards();
    return wards.find(w => w.code === code);
  }

  // Update cache
  updateCache(data: Partial<Omit<LocationCache, 'lastUpdated' | 'version'>>): void {
    if (!this.cache) {
      this.cache = {
        provinces: [],
        districts: [],
        wards: [],
        lastUpdated: new Date().toISOString(),
        version: this.config.version
      };
    }

    Object.assign(this.cache, {
      ...data,
      lastUpdated: new Date().toISOString(),
      version: this.config.version
    });

    this.saveToStorage();
  }

  // Add data incrementally
  addDistricts(districts: District[]): void {
    const existingDistricts = this.getDistricts();
    const newDistricts = [...existingDistricts];

    districts.forEach(district => {
      const existingIndex = newDistricts.findIndex(d => d.code === district.code);
      if (existingIndex >= 0) {
        newDistricts[existingIndex] = district;
      } else {
        newDistricts.push(district);
      }
    });

    this.updateCache({ districts: newDistricts });
  }

  addWards(wards: Ward[]): void {
    const existingWards = this.getWards();
    const newWards = [...existingWards];

    wards.forEach(ward => {
      const existingIndex = newWards.findIndex(w => w.code === ward.code);
      if (existingIndex >= 0) {
        newWards[existingIndex] = ward;
      } else {
        newWards.push(ward);
      }
    });

    this.updateCache({ wards: newWards });
  }

  // Cache status
  hasData(): boolean {
    return !!(this.cache && this.cache.provinces.length > 0);
  }

  isStale(): boolean {
    if (!this.cache) return true;
    const age = Date.now() - new Date(this.cache.lastUpdated).getTime();
    return age > this.config.maxAge;
  }

  // Get stats with async data
  async getStats() {
    const [provinces, districts, wards] = await Promise.all([
      this.getProvinces(),
      this.getDistricts(),
      this.getWards()
    ]);

    return {
      totalProvinces: provinces.length,
      totalDistricts: districts.length,
      totalWards: wards.length,
      lastUpdated: this.cache?.lastUpdated || null,
      version: this.cache?.version || null,
      isStale: this.isStale()
    };
  }

  // Format address with async data
  async formatAddress(options: {
    address?: string;
    wardCode?: number;
    districtCode?: number;
    provinceCode?: number;
  }): Promise<string> {
    const parts: string[] = [];

    if (options.address) {
      parts.push(options.address);
    }

    if (options.wardCode) {
      const ward = await this.findWardByCode(options.wardCode);
      if (ward) {
        parts.push(ward.name);
      }
    }

    if (options.districtCode) {
      const district = await this.findDistrictByCode(options.districtCode);
      if (district) {
        parts.push(district.name);
      }
    }

    if (options.provinceCode) {
      const province = await this.findProvinceByCode(options.provinceCode);
      if (province) {
        parts.push(province.name);
      }
    }

    return parts.join(', ');
  }

  // Utility methods
  clearCache(): void {
    this.cache = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.config.cacheKey);
    }
  }

  exportData(): string {
    return JSON.stringify(this.cache, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as LocationCache;
      
      // Validate structure
      if (!data.provinces || !Array.isArray(data.provinces)) {
        throw new Error('Invalid provinces data');
      }

      this.cache = {
        ...data,
        lastUpdated: new Date().toISOString(),
        version: this.config.version
      };
      
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Error importing location data:', error);
      return false;
    }
  }

  // Get hierarchical data for a specific location
  getLocationPath(wardCode?: number, districtCode?: number, provinceCode?: number) {
    let province: Province | undefined;
    let district: District | undefined;
    let ward: Ward | undefined;

    if (wardCode) {
      ward = this.findWardByCode(wardCode);
      if (ward) {
        district = this.findDistrictByCode(ward.district_code);
      }
    }

    if (districtCode && !district) {
      district = this.findDistrictByCode(districtCode);
    }

    if (district && !province) {
      province = this.findProvinceByCode(district.province_code);
    }

    if (provinceCode && !province) {
      province = this.findProvinceByCode(provinceCode);
    }

    return { province, district, ward };
  }

  getLastError(): Error | null {
    return this.lastError;
  }
}

// Create singleton instance
const locationManager = new LocationManagerService();

// Export convenience functions
export const getLocationManager = () => locationManager;

export const useLocationData = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const manager = getLocationManager();
        await manager.loadFromStorage();
        
        setProvinces(manager.getProvinces());
        setDistricts(manager.getDistricts());
        setWards(manager.getWards());
        setError(null);
      } catch (err) {
        console.error('Error loading location data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { provinces, districts, wards, loading, error };
}; 