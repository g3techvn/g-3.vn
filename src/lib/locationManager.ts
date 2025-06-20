import { Province, District, Ward } from './provinces';

export interface LocationCache {
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  lastUpdated: string;
  version: string;
}

export interface LocationManagerConfig {
  cacheKey: string;
  version: string;
  maxAge: number; // in milliseconds
}

class LocationManagerService {
  private config: LocationManagerConfig = {
    cacheKey: 'g3_location_data',
    version: '1.0',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };

  private cache: LocationCache | null = null;

  constructor(config?: Partial<LocationManagerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.config.cacheKey);
      if (stored) {
        const data = JSON.parse(stored) as LocationCache;
        
        // Check version and age
        const age = Date.now() - new Date(data.lastUpdated).getTime();
        if (data.version === this.config.version && age < this.config.maxAge) {
          this.cache = data;
        } else {
          // Clear outdated cache
          this.clearCache();
        }
      }
    } catch (error) {
      console.error('Error loading location cache:', error);
      this.clearCache();
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

  // Get cached data
  getProvinces(): Province[] {
    return this.cache?.provinces || [];
  }

  getDistricts(provinceCode?: number): District[] {
    const districts = this.cache?.districts || [];
    if (provinceCode) {
      return districts.filter(d => d.province_code === provinceCode);
    }
    return districts;
  }

  getWards(districtCode?: number): Ward[] {
    const wards = this.cache?.wards || [];
    if (districtCode) {
      return wards.filter(w => w.district_code === districtCode);
    }
    return wards;
  }

  // Find methods
  findProvinceByCode(code: number): Province | undefined {
    return this.getProvinces().find(p => p.code === code);
  }

  findProvinceByName(name: string): Province | undefined {
    return this.getProvinces().find(p => 
      p.name.toLowerCase().includes(name.toLowerCase()) ||
      p.codename.toLowerCase().includes(name.toLowerCase())
    );
  }

  findDistrictByCode(code: number): District | undefined {
    return this.getDistricts().find(d => d.code === code);
  }

  findWardByCode(code: number): Ward | undefined {
    return this.getWards().find(w => w.code === code);
  }

  // Update cache
  updateCache(data: Partial<Omit<LocationCache, 'lastUpdated' | 'version'>>): void {
    const newCache: LocationCache = {
      provinces: data.provinces || this.cache?.provinces || [],
      districts: data.districts || this.cache?.districts || [],
      wards: data.wards || this.cache?.wards || [],
      lastUpdated: new Date().toISOString(),
      version: this.config.version
    };

    this.cache = newCache;
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

  getStats() {
    return {
      totalProvinces: this.getProvinces().length,
      totalDistricts: this.getDistricts().length,
      totalWards: this.getWards().length,
      lastUpdated: this.cache?.lastUpdated || null,
      version: this.cache?.version || null,
      isStale: this.isStale()
    };
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

  // Format address string
  formatAddress(options: {
    address?: string;
    wardCode?: number;
    districtCode?: number;
    provinceCode?: number;
  }): string {
    const { province, district, ward } = this.getLocationPath(
      options.wardCode,
      options.districtCode,
      options.provinceCode
    );

    const parts = [];
    if (options.address) parts.push(options.address);
    if (ward) parts.push(ward.name);
    if (district) parts.push(district.name);
    if (province) parts.push(province.name);

    return parts.join(', ');
  }
}

// Create singleton instance
export const locationManager = new LocationManagerService();

// Export convenience functions
export const getLocationManager = () => locationManager;

export const useLocationData = () => {
  return {
    provinces: locationManager.getProvinces(),
    getDistricts: (provinceCode?: number) => locationManager.getDistricts(provinceCode),
    getWards: (districtCode?: number) => locationManager.getWards(districtCode),
    findProvince: (code: number) => locationManager.findProvinceByCode(code),
    findDistrict: (code: number) => locationManager.findDistrictByCode(code),
    findWard: (code: number) => locationManager.findWardByCode(code),
    formatAddress: (options: Parameters<typeof locationManager.formatAddress>[0]) => 
      locationManager.formatAddress(options),
    hasData: () => locationManager.hasData(),
    isStale: () => locationManager.isStale(),
    stats: locationManager.getStats()
  };
}; 