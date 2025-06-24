'use client';

import { useState, useEffect } from 'react';
import { useLocationData } from '@/lib/locationManager';
import { useToast } from "@/hooks/useToast";
import { District, Ward } from '@/lib/provinces';

interface LocationSelectorProps {
  selectedProvinceCode?: number;
  selectedDistrictCode?: number;
  selectedWardCode?: number;
  onProvinceChange: (code: number, name: string) => void;
  onDistrictChange: (code: number, name: string) => void;
  onWardChange: (code: number, name: string) => void;
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
  const { provinces, getDistricts, getWards, stats, hasData } = useLocationData();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState({
    districts: false,
    wards: false
  });

  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    if (!hasData) {
      showToast('Đang tải dữ liệu địa chỉ...', 'default');
      return;
    }

    if (stats) {
      showToast(`Đã tải ${stats.totalProvinces} tỉnh/thành, ${stats.totalDistricts} quận/huyện, ${stats.totalWards} phường/xã`, 'default');
    }
  }, [hasData, stats]);

  useEffect(() => {
    async function loadDistricts() {
      if (selectedProvinceCode) {
        setLoading(prev => ({ ...prev, districts: true }));
        try {
          const districtsData = await getDistricts(selectedProvinceCode);
          setDistricts(districtsData);
          if (districtsData.length === 0) {
            showToast('Không có dữ liệu quận/huyện', 'destructive');
          }
        } catch (error) {
          console.error('Error loading districts:', error);
          showToast('Lỗi khi tải danh sách quận/huyện', 'destructive');
        } finally {
          setLoading(prev => ({ ...prev, districts: false }));
        }
      } else {
        setDistricts([]);
      }
    }
    loadDistricts();
  }, [selectedProvinceCode, getDistricts]);

  useEffect(() => {
    async function loadWards() {
      if (selectedDistrictCode) {
        setLoading(prev => ({ ...prev, wards: true }));
        try {
          const wardsData = await getWards(selectedDistrictCode);
          setWards(wardsData);
          if (wardsData.length === 0) {
            showToast('Không có dữ liệu phường/xã', 'destructive');
          }
        } catch (error) {
          console.error('Error loading wards:', error);
          showToast('Lỗi khi tải danh sách phường/xã', 'destructive');
        } finally {
          setLoading(prev => ({ ...prev, wards: false }));
        }
      } else {
        setWards([]);
      }
    }
    loadWards();
  }, [selectedDistrictCode, getWards]);

  useEffect(() => {
    if (selectedProvinceCode) {
      const province = provinces.find(p => p.code === selectedProvinceCode);
      if (province) {
        onProvinceChange(province.code, province.name);
      } else {
        showToast('Không tìm thấy tỉnh/thành phố', 'destructive');
      }
    }
  }, [selectedProvinceCode, provinces, onProvinceChange]);

  useEffect(() => {
    if (selectedDistrictCode && districts.length > 0) {
      const district = districts.find(d => d.code === selectedDistrictCode);
      if (district) {
        onDistrictChange(district.code, district.name);
      } else {
        showToast('Không tìm thấy quận/huyện', 'destructive');
      }
    }
  }, [selectedDistrictCode, districts, onDistrictChange]);

  useEffect(() => {
    if (selectedWardCode && wards.length > 0) {
      const ward = wards.find(w => w.code === selectedWardCode);
      if (ward) {
        onWardChange(ward.code, ward.name);
      } else {
        showToast('Không tìm thấy phường/xã', 'destructive');
      }
    }
  }, [selectedWardCode, wards, onWardChange]);

  return (
    <div className="space-y-4">
      {/* Province Select */}
      <div>
        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
          Tỉnh/Thành phố
        </label>
        <select
          id="province"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          value={selectedProvinceCode || ''}
          onChange={(e) => {
            const province = provinces.find(p => p.code === Number(e.target.value));
            if (province) {
              onProvinceChange(province.code, province.name);
            }
          }}
          disabled={disabled}
        >
          <option value="">Chọn Tỉnh/Thành phố</option>
          {provinces.map(province => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Select */}
      <div>
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
          Quận/Huyện
        </label>
        <select
          id="district"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          value={selectedDistrictCode || ''}
          onChange={(e) => {
            const district = districts.find(d => d.code === Number(e.target.value));
            if (district) {
              onDistrictChange(district.code, district.name);
            }
          }}
          disabled={!selectedProvinceCode || loading.districts || disabled}
        >
          <option value="">Chọn Quận/Huyện</option>
          {districts.map(district => (
            <option key={district.code} value={district.code}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ward Select */}
      <div>
        <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
          Phường/Xã
        </label>
        <select
          id="ward"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          value={selectedWardCode || ''}
          onChange={(e) => {
            const ward = wards.find(w => w.code === Number(e.target.value));
            if (ward) {
              onWardChange(ward.code, ward.name);
            }
          }}
          disabled={!selectedDistrictCode || loading.wards || disabled}
        >
          <option value="">Chọn Phường/Xã</option>
          {wards.map(ward => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 