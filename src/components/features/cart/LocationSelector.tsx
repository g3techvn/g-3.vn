'use client';

import { useState, useEffect } from 'react';
import { useLocationData } from '@/lib/locationManager';
import { useToast } from "@/hooks/useToast";
import { District, Ward, Province } from '@/lib/provinces';
import { ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline';

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
  const { provinces, districts, wards, loading, error } = useLocationData();
  const { showToast } = useToast();
  
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [filteredWards, setFilteredWards] = useState<Ward[]>([]);

  // Filter districts when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      const districtsForProvince = districts.filter(d => d.province_code === selectedProvinceCode);
      setFilteredDistricts(districtsForProvince);
      
      if (districtsForProvince.length === 0) {
        showToast('Không có dữ liệu quận/huyện cho tỉnh/thành phố này', 'destructive');
      }
      
      // Reset ward selection when province changes
      setFilteredWards([]);
      onWardChange(0, '');
    } else {
      setFilteredDistricts([]);
      setFilteredWards([]);
    }
  }, [selectedProvinceCode, districts]);

  // Filter wards when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      const wardsForDistrict = wards.filter(w => w.district_code === selectedDistrictCode);
      setFilteredWards(wardsForDistrict);
      
      if (wardsForDistrict.length === 0) {
        showToast('Không có dữ liệu phường/xã cho quận/huyện này', 'destructive');
      }
    } else {
      setFilteredWards([]);
    }
  }, [selectedDistrictCode, wards]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-6">
        <MapPinIcon className="w-12 h-12 mx-auto mb-3 text-red-400" />
        <p className="text-sm mb-4">
          {error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải dữ liệu địa chỉ'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  const SelectField = ({ 
    id, 
    label, 
    value, 
    onChange, 
    options, 
    placeholder, 
    disabled: fieldDisabled 
  }: {
    id: string;
    label: string;
    value: number | string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ code: number; name: string }>;
    placeholder: string;
    disabled?: boolean;
  }) => (
    <div className="relative mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <select
          id={id}
          className={`
            appearance-none block w-full px-3 py-2
            text-base border ${fieldDisabled ? 'border-gray-300' : 'border-gray-300'}
            rounded-md
            placeholder-gray-400
            focus:outline-none focus:ring-1 focus:ring-red-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors
            ${fieldDisabled ? 'bg-gray-50' : 'bg-white'}
          `}
          value={value}
          onChange={onChange}
          disabled={disabled || fieldDisabled}
        >
          <option value="" className="text-gray-500">{placeholder}</option>
          {options.map((option) => (
            <option key={option.code} value={option.code} className="text-gray-900">
              {option.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDownIcon 
            className={`h-5 w-5 transition-colors ${fieldDisabled ? 'text-gray-400' : 'text-gray-500'}`} 
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center mb-3 mt-6">
        <div className="w-8 h-8 mr-2">
          <MapPinIcon className="w-full h-full text-red-600" />
        </div>
        <span className="text-lg font-medium">Thông tin địa chỉ</span>
      </div>

      <div className="bg-white p-4">
        {/* Province Select */}
        <SelectField
          id="province"
          label="Tỉnh/Thành phố"
          value={selectedProvinceCode || ''}
          onChange={(e) => {
            const code = Number(e.target.value);
            const province = provinces.find((p: Province) => p.code === code);
            if (province) {
              onProvinceChange(province.code, province.name);
              // Reset district and ward
              onDistrictChange(0, '');
              onWardChange(0, '');
            }
          }}
          options={provinces}
          placeholder="Chọn Tỉnh/Thành phố"
        />

        {/* District Select */}
        <SelectField
          id="district"
          label="Quận/Huyện"
          value={selectedDistrictCode || ''}
          onChange={(e) => {
            const code = Number(e.target.value);
            const district = filteredDistricts.find((d: District) => d.code === code);
            if (district) {
              onDistrictChange(district.code, district.name);
              // Reset ward
              onWardChange(0, '');
            }
          }}
          options={filteredDistricts}
          placeholder="Chọn Quận/Huyện"
          disabled={!selectedProvinceCode}
        />

        {/* Ward Select */}
        <SelectField
          id="ward"
          label="Phường/Xã"
          value={selectedWardCode || ''}
          onChange={(e) => {
            const code = Number(e.target.value);
            const ward = filteredWards.find((w: Ward) => w.code === code);
            if (ward) {
              onWardChange(ward.code, ward.name);
            }
          }}
          options={filteredWards}
          placeholder="Chọn Phường/Xã"
          disabled={!selectedDistrictCode}
        />

        {/* Info message for mobile users */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg md:hidden">
          <p className="text-sm text-blue-700">
            💡 Chọn từ trên xuống dưới: Tỉnh/Thành phố → Quận/Huyện → Phường/Xã
          </p>
        </div>
      </div>
    </>
  );
} 