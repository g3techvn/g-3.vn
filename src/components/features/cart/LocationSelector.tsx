'use client';

import { useState, useEffect } from 'react';
import { useLocationDatabase, Province, District, Ward } from '@/lib/locationDatabase';
import { useToast } from '@/components/ui/Toast';

interface LocationSelectorProps {
  selectedProvinceCode?: number;
  selectedDistrictCode?: number;
  selectedWardCode?: number;
  onProvinceChange: (provinceCode: number, provinceName: string) => void;
  onDistrictChange: (districtCode: number, districtName: string) => void;
  onWardChange: (wardCode: number, wardName: string) => void;
  disabled?: boolean;
}

export default function LocationSelector({
  selectedProvinceCode,
  selectedDistrictCode,
  selectedWardCode,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  disabled = false
}: LocationSelectorProps) {
  const { 
    getProvinces, 
    getDistricts, 
    getWards, 
    hasLocationData,
    getLocationStats 
  } = useLocationDatabase();
  
  const { showToast } = useToast();
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [hasData, setHasData] = useState<boolean>(false);
  
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
    checking: true
  });

  // Check if database has data on mount
  useEffect(() => {
    checkDatabaseData();
  }, []);

  // Load provinces when database has data
  useEffect(() => {
    if (hasData && provinces.length === 0) {
      loadProvinces();
    }
  }, [hasData, provinces.length]);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      loadDistricts(selectedProvinceCode);
      // Reset wards when province changes
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvinceCode]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      loadWards(selectedDistrictCode);
    } else {
      setWards([]);
    }
  }, [selectedDistrictCode]);

  const checkDatabaseData = async () => {
    setLoading(prev => ({ ...prev, checking: true }));
    try {
      const dataExists = await hasLocationData();
      setHasData(dataExists);
      
      if (dataExists) {
        const stats = await getLocationStats();
        console.log('📊 Location database stats:', stats);
      } else {
        showToast('Database chưa có dữ liệu địa điểm. Vui lòng liên hệ admin để sync dữ liệu.', 'warning');
      }
    } catch (error) {
      console.error('Error checking database data:', error);
      showToast('Không thể kết nối database. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(prev => ({ ...prev, checking: false }));
    }
  };

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const provincesData = await getProvinces();
      setProvinces(provincesData);
    } catch (error) {
      console.error('Error loading provinces:', error);
      showToast('Không thể tải danh sách tỉnh thành. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadDistricts = async (provinceCode: number) => {
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      const districtsData = await getDistricts(provinceCode);
      setDistricts(districtsData);
    } catch (error) {
      console.error('Error loading districts:', error);
      showToast('Không thể tải danh sách quận huyện. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const loadWards = async (districtCode: number) => {
    setLoading(prev => ({ ...prev, wards: true }));
    try {
      const wardsData = await getWards(districtCode);
      setWards(wardsData);
    } catch (error) {
      console.error('Error loading wards:', error);
      showToast('Không thể tải danh sách phường xã. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(prev => ({ ...prev, wards: false }));
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = Number(e.target.value);
    if (!provinceCode) {
      onProvinceChange(0, '');
      return;
    }

    const province = provinces.find(p => p.code === provinceCode);
    if (province) {
      onProvinceChange(provinceCode, province.name);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value);
    if (!districtCode) {
      onDistrictChange(0, '');
      return;
    }

    const district = districts.find(d => d.code === districtCode);
    if (district) {
      onDistrictChange(districtCode, district.name);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardCode = Number(e.target.value);
    if (!wardCode) {
      onWardChange(0, '');
      return;
    }

    const ward = wards.find(w => w.code === wardCode);
    if (ward) {
      onWardChange(wardCode, ward.name);
    }
  };

  // Show loading state while checking database
  if (loading.checking) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <div className="text-blue-800 text-sm font-medium">Đang kiểm tra dữ liệu...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no database data
  if (!hasData) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 text-sm font-medium">❌ Chưa có dữ liệu địa điểm</div>
          <div className="text-red-600 text-xs mt-1">
            Database chưa được đồng bộ dữ liệu. Vui lòng liên hệ admin để cập nhật dữ liệu địa điểm.
          </div>
          <button
            onClick={checkDatabaseData}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Province Selection */}
      <div>
        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
          Tỉnh/Thành phố <span className="text-red-500">*</span>
        </label>
        <select
          id="province"
          value={selectedProvinceCode || ''}
          onChange={handleProvinceChange}
          disabled={disabled || loading.provinces}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {loading.provinces ? 'Đang tải tỉnh thành...' : 'Chọn Tỉnh/Thành phố'}
          </option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Selection */}
      <div>
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
          Quận/Huyện <span className="text-red-500">*</span>
        </label>
        <select
          id="district"
          value={selectedDistrictCode || ''}
          onChange={handleDistrictChange}
          disabled={disabled || !selectedProvinceCode || loading.districts}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {loading.districts ? 'Đang tải quận huyện...' : 
             !selectedProvinceCode ? 'Vui lòng chọn tỉnh/thành phố trước' : 
             'Chọn Quận/Huyện'}
          </option>
          {districts.map((district) => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ward Selection */}
      <div>
        <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
          Phường/Xã <span className="text-red-500">*</span>
        </label>
        <select
          id="ward"
          value={selectedWardCode || ''}
          onChange={handleWardChange}
          disabled={disabled || !selectedDistrictCode || loading.wards}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {loading.wards ? 'Đang tải phường xã...' : 
             !selectedDistrictCode ? 'Vui lòng chọn quận/huyện trước' : 
             'Chọn Phường/Xã'}
          </option>
          {wards.map((ward) => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
} 