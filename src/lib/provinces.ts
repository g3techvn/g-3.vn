const API_URL = 'https://provinces.open-api.vn/api';

// Add cache for API responses
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export interface Province {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}

export interface District {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  district_code: number;
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
      
      // Cache successful response
      setCachedData(url, data);
      
      return data;
    } catch (error) {
      console.warn(`Attempt ${attempt} failed for ${url}:`, error);
      
      if (attempt === maxRetries) {
        // On final failure, try to return fallback data
        const fallbackData = getFallbackData(url);
        if (fallbackData) {
          console.warn('Using fallback data for', url);
          return fallbackData;
        }
        throw new Error(`Failed to fetch data after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Fallback data for critical provinces
function getFallbackData(url: string): any {
  if (url.includes('/p/')) {
    return [
      { code: 1, name: "Thành phố Hà Nội", division_type: "tỉnh", codename: "thanh_pho_ha_noi", phone_code: 24 },
      { code: 79, name: "Thành phố Hồ Chí Minh", division_type: "tỉnh", codename: "thanh_pho_ho_chi_minh", phone_code: 28 },
      { code: 48, name: "Thành phố Đà Nẵng", division_type: "tỉnh", codename: "thanh_pho_da_nang", phone_code: 236 },
      { code: 31, name: "Thành phố Hải Phòng", division_type: "tỉnh", codename: "thanh_pho_hai_phong", phone_code: 225 },
      { code: 92, name: "Thành phố Cần Thơ", division_type: "tỉnh", codename: "thanh_pho_can_tho", phone_code: 292 }
    ];
  }
  return null;
}

export async function getProvinces(): Promise<Province[]> {
  try {
    return await fetchWithRetry(`${API_URL}/p/`);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw new Error('Không thể tải danh sách tỉnh thành. Vui lòng thử lại sau.');
  }
}

export async function getDistricts(provinceCode: number): Promise<District[]> {
  try {
    const data = await fetchWithRetry(`${API_URL}/p/${provinceCode}?depth=2`);
    return data.districts || [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw new Error('Không thể tải danh sách quận huyện. Vui lòng thử lại sau.');
  }
}

export async function getWards(districtCode: number): Promise<Ward[]> {
  try {
    const data = await fetchWithRetry(`${API_URL}/d/${districtCode}?depth=2`);
    return data.wards || [];
  } catch (error) {
    console.error('Error fetching wards:', error);
    throw new Error('Không thể tải danh sách phường xã. Vui lòng thử lại sau.');
  }
}

// Clear cache function (useful for debugging or manual refresh)
export function clearProvincesCache(): void {
  cache.clear();
} 