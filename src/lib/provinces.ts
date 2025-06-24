// Update API URL to use HTTPS and add backup URL
const API_URLS = {
  PRIMARY: 'https://provinces.open-api.vn/api',
  BACKUP: 'https://vapi.vnappmob.com/api/province'
};

// Add cache for API responses
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

export interface Province {
  id: number;
  code: number;
  name: string;
  codename: string;
  division_type: string;
  phone_code: number;
  created_at?: string;
  updated_at?: string;
}

export interface District {
  id: number;
  code: number;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
  province_code: number;
  created_at?: string;
  updated_at?: string;
}

export interface Ward {
  id: number;
  code: number;
  name: string;
  codename: string;
  division_type: string;
  short_codename: string;
  district_code: number;
  created_at?: string;
  updated_at?: string;
}

export interface LocationData {
  provinces: Province[];
  districts: District[];
  wards: Ward[];
}

// Generic fetch with retry and timeout
async function fetchWithRetry(url: string, maxRetries = 3, timeout = 10000): Promise<any> {
  const getCachedData = (key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  };

  // Check cache first
  const cachedData = getCachedData(url);
  if (cachedData) {
    return cachedData;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate data structure
      if (!isValidData(data)) {
        throw new Error('Invalid data structure received from API');
      }
      
      // Cache successful response
      setCachedData(url, data);
      
      return data;
    } catch (error) {
      console.warn(`Attempt ${attempt} failed for ${url}:`, error);
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        // Try backup API on final attempt
        try {
          const backupData = await tryBackupApi(url);
          if (backupData) {
            console.log('Successfully fetched from backup API');
            return backupData;
          }
        } catch (backupError) {
          console.error('Backup API also failed:', backupError);
        }
        
        // If both APIs fail, try fallback data
        const fallbackData = getFallbackData(url);
        if (fallbackData) {
          console.warn('Using fallback data for', url);
          return fallbackData;
        }
        
        throw new Error(`Failed to fetch data after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Validate data structure
function isValidData(data: any): boolean {
  if (Array.isArray(data)) {
    return data.every(item => 
      typeof item === 'object' &&
      typeof item.code === 'number' &&
      typeof item.name === 'string'
    );
  }
  
  if (typeof data === 'object' && data !== null) {
    return (
      Array.isArray(data.districts) ||
      Array.isArray(data.wards)
    );
  }
  
  return false;
}

// Try backup API
async function tryBackupApi(originalUrl: string): Promise<any> {
  const urlParts = originalUrl.split('/');
  const type = urlParts[urlParts.length - 2];
  const code = urlParts[urlParts.length - 1].split('?')[0];
  
  let backupUrl = '';
  
  switch (type) {
    case 'p':
      backupUrl = `${API_URLS.BACKUP}`;
      break;
    case 'd':
      backupUrl = `${API_URLS.BACKUP}/district/${code}`;
      break;
    case 'w':
      backupUrl = `${API_URLS.BACKUP}/ward/${code}`;
      break;
    default:
      return null;
  }
  
  const response = await fetch(backupUrl);
  if (!response.ok) {
    throw new Error(`Backup API error: ${response.status}`);
  }
  
  const data = await response.json();
  return transformBackupData(data, type);
}

// Transform backup API data to match primary API structure
function transformBackupData(data: any, type: string): any {
  switch (type) {
    case 'p':
      return data.results.map((item: any) => ({
        code: parseInt(item.province_id),
        name: item.province_name,
        division_type: 'tỉnh',
        codename: item.province_name.toLowerCase().replace(/ /g, '_'),
        phone_code: 0
      }));
    case 'd':
      return {
        districts: data.results.map((item: any) => ({
          code: parseInt(item.district_id),
          name: item.district_name,
          division_type: 'huyện',
          codename: item.district_name.toLowerCase().replace(/ /g, '_'),
          province_code: parseInt(item.province_id)
        }))
      };
    case 'w':
      return {
        wards: data.results.map((item: any) => ({
          code: parseInt(item.ward_id),
          name: item.ward_name,
          division_type: 'xã',
          codename: item.ward_name.toLowerCase().replace(/ /g, '_'),
          district_code: parseInt(item.district_id)
        }))
      };
    default:
      return null;
  }
}

// Fallback data for critical provinces
function getFallbackData(url: string): any {
  if (url.includes('/p/')) {
    return [
      { code: 1, name: "Thành phố Hà Nội", division_type: "thành phố", codename: "ha_noi", phone_code: 24 },
      { code: 79, name: "Thành phố Hồ Chí Minh", division_type: "thành phố", codename: "ho_chi_minh", phone_code: 28 },
      { code: 48, name: "Thành phố Đà Nẵng", division_type: "thành phố", codename: "da_nang", phone_code: 236 },
      { code: 31, name: "Thành phố Hải Phòng", division_type: "thành phố", codename: "hai_phong", phone_code: 225 },
      { code: 92, name: "Thành phố Cần Thơ", division_type: "thành phố", codename: "can_tho", phone_code: 292 }
    ];
  }
  return null;
}

export async function getProvinces(): Promise<Province[]> {
  try {
    const data = await fetchWithRetry(`${API_URLS.PRIMARY}/p/`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw new Error('Không thể tải danh sách tỉnh thành. Vui lòng thử lại sau.');
  }
}

export async function getDistricts(provinceCode: number): Promise<District[]> {
  try {
    const data = await fetchWithRetry(`${API_URLS.PRIMARY}/p/${provinceCode}?depth=2`);
    return data?.districts || [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw new Error('Không thể tải danh sách quận huyện. Vui lòng thử lại sau.');
  }
}

export async function getWards(districtCode: number): Promise<Ward[]> {
  try {
    const data = await fetchWithRetry(`${API_URLS.PRIMARY}/d/${districtCode}?depth=2`);
    return data?.wards || [];
  } catch (error) {
    console.error('Error fetching wards:', error);
    throw new Error('Không thể tải danh sách phường xã. Vui lòng thử lại sau.');
  }
}

// Clear cache function (useful for debugging or manual refresh)
export function clearProvincesCache(): void {
  cache.clear();
} 