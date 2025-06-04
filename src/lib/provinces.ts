const API_URL = 'https://provinces.open-api.vn/api';

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

export async function getProvinces(): Promise<Province[]> {
  const response = await fetch(`${API_URL}/p/`);
  if (!response.ok) {
    throw new Error('Failed to fetch provinces');
  }
  return response.json();
}

export async function getDistricts(provinceCode: number): Promise<District[]> {
  const response = await fetch(`${API_URL}/p/${provinceCode}?depth=2`);
  if (!response.ok) {
    throw new Error('Failed to fetch districts');
  }
  const data = await response.json();
  return data.districts;
}

export async function getWards(districtCode: number): Promise<Ward[]> {
  const response = await fetch(`${API_URL}/d/${districtCode}?depth=2`);
  if (!response.ok) {
    throw new Error('Failed to fetch wards');
  }
  const data = await response.json();
  return data.wards;
} 