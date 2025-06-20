import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface Province {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
}

export interface District {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
  district_code: number;
}

export interface LocationMetadata {
  cache_key: string;
  total_provinces: number;
  total_districts: number;
  total_wards: number;
  last_updated: string;
}

// Cache for browser performance
const locationCache = {
  provinces: null as Province[] | null,
  districts: new Map<number, District[]>(),
  wards: new Map<number, Ward[]>(),
  metadata: null as LocationMetadata | null,
  lastCacheTime: 0,
  cacheTimeout: 30 * 60 * 1000 // 30 minutes
};

// Check if cache is valid
function isCacheValid(): boolean {
  return Date.now() - locationCache.lastCacheTime < locationCache.cacheTimeout;
}

// Clear expired cache
function clearExpiredCache(): void {
  if (!isCacheValid()) {
    locationCache.provinces = null;
    locationCache.districts.clear();
    locationCache.wards.clear();
    locationCache.metadata = null;
    locationCache.lastCacheTime = 0;
  }
}

/**
 * Get all provinces from database
 */
export async function getProvincesFromDB(): Promise<Province[]> {
  clearExpiredCache();
  
  // Return from cache if available
  if (locationCache.provinces && isCacheValid()) {
    return locationCache.provinces;
  }

  try {
    const { data, error } = await supabase
      .from('provinces')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No provinces found in database');
    }

    // Cache the result
    locationCache.provinces = data;
    locationCache.lastCacheTime = Date.now();

    return data;
  } catch (error) {
    console.error('Error fetching provinces from database:', error);
    throw error;
  }
}

/**
 * Get districts for a province from database
 */
export async function getDistrictsFromDB(provinceCode: number): Promise<District[]> {
  clearExpiredCache();
  
  // Return from cache if available
  if (locationCache.districts.has(provinceCode) && isCacheValid()) {
    return locationCache.districts.get(provinceCode)!;
  }

  try {
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .eq('province_code', provinceCode)
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const districts = data || [];
    
    // Cache the result
    locationCache.districts.set(provinceCode, districts);
    locationCache.lastCacheTime = Date.now();

    return districts;
  } catch (error) {
    console.error(`Error fetching districts for province ${provinceCode}:`, error);
    throw error;
  }
}

/**
 * Get wards for a district from database
 */
export async function getWardsFromDB(districtCode: number): Promise<Ward[]> {
  clearExpiredCache();
  
  // Return from cache if available
  if (locationCache.wards.has(districtCode) && isCacheValid()) {
    return locationCache.wards.get(districtCode)!;
  }

  try {
    const { data, error } = await supabase
      .from('wards')
      .select('*')
      .eq('district_code', districtCode)
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const wards = data || [];
    
    // Cache the result
    locationCache.wards.set(districtCode, wards);
    locationCache.lastCacheTime = Date.now();

    return wards;
  } catch (error) {
    console.error(`Error fetching wards for district ${districtCode}:`, error);
    throw error;
  }
}

/**
 * Get location metadata from database
 */
export async function getLocationMetadata(): Promise<LocationMetadata | null> {
  clearExpiredCache();
  
  // Return from cache if available
  if (locationCache.metadata && isCacheValid()) {
    return locationCache.metadata;
  }

  try {
    const { data, error } = await supabase
      .from('location_metadata')
      .select('*')
      .eq('cache_key', 'g3_location_data')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return null;
      }
      throw new Error(`Database error: ${error.message}`);
    }

    // Cache the result
    locationCache.metadata = data;
    locationCache.lastCacheTime = Date.now();

    return data;
  } catch (error) {
    console.error('Error fetching location metadata:', error);
    return null;
  }
}

/**
 * Search provinces by name
 */
export async function searchProvinces(query: string): Promise<Province[]> {
  try {
    const provinces = await getProvincesFromDB();
    const searchTerm = query.toLowerCase().trim();
    
    return provinces.filter(province => 
      province.name.toLowerCase().includes(searchTerm) ||
      province.codename.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching provinces:', error);
    throw error;
  }
}

/**
 * Search districts by name within a province
 */
export async function searchDistricts(provinceCode: number, query: string): Promise<District[]> {
  try {
    const districts = await getDistrictsFromDB(provinceCode);
    const searchTerm = query.toLowerCase().trim();
    
    return districts.filter(district => 
      district.name.toLowerCase().includes(searchTerm) ||
      district.codename.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching districts:', error);
    throw error;
  }
}

/**
 * Search wards by name within a district
 */
export async function searchWards(districtCode: number, query: string): Promise<Ward[]> {
  try {
    const wards = await getWardsFromDB(districtCode);
    const searchTerm = query.toLowerCase().trim();
    
    return wards.filter(ward => 
      ward.name.toLowerCase().includes(searchTerm) ||
      ward.codename.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching wards:', error);
    throw error;
  }
}

/**
 * Get location name by code
 */
export async function getLocationNames(provinceCode: number, districtCode?: number, wardCode?: number) {
  try {
    const provinces = await getProvincesFromDB();
    const province = provinces.find(p => p.code === provinceCode);
    
    const result: { province?: string; district?: string; ward?: string } = {};
    
    if (province) {
      result.province = province.name;
      
      if (districtCode) {
        const districts = await getDistrictsFromDB(provinceCode);
        const district = districts.find(d => d.code === districtCode);
        
        if (district) {
          result.district = district.name;
          
          if (wardCode) {
            const wards = await getWardsFromDB(districtCode);
            const ward = wards.find(w => w.code === wardCode);
            
            if (ward) {
              result.ward = ward.name;
            }
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error getting location names:', error);
    throw error;
  }
}

/**
 * Check if database has location data
 */
export async function hasLocationData(): Promise<boolean> {
  try {
    const metadata = await getLocationMetadata();
    return metadata !== null && 
           metadata.total_provinces > 0 && 
           metadata.total_districts > 0;
  } catch (error) {
    console.error('Error checking location data:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getLocationStats() {
  try {
    const metadata = await getLocationMetadata();
    if (!metadata) {
      return null;
    }

    return {
      provinces: metadata.total_provinces,
      districts: metadata.total_districts,
      wards: metadata.total_wards,
      lastUpdated: new Date(metadata.last_updated),
      databaseSource: true
    };
  } catch (error) {
    console.error('Error getting location stats:', error);
    return null;
  }
}

/**
 * Clear all location cache
 */
export function clearLocationCache(): void {
  locationCache.provinces = null;
  locationCache.districts.clear();
  locationCache.wards.clear();
  locationCache.metadata = null;
  locationCache.lastCacheTime = 0;
}

/**
 * Preload location data for better performance
 */
export async function preloadLocationData(): Promise<void> {
  try {
    // Preload provinces
    await getProvincesFromDB();
    
    // Preload metadata
    await getLocationMetadata();
    
    console.log('✅ Location data preloaded successfully');
  } catch (error) {
    console.error('❌ Failed to preload location data:', error);
  }
}

// Export a hook for React components
export function useLocationDatabase() {
  return {
    getProvinces: getProvincesFromDB,
    getDistricts: getDistrictsFromDB,
    getWards: getWardsFromDB,
    getMetadata: getLocationMetadata,
    searchProvinces,
    searchDistricts,
    searchWards,
    getLocationNames,
    hasLocationData,
    getLocationStats,
    clearCache: clearLocationCache,
    preloadData: preloadLocationData
  };
} 