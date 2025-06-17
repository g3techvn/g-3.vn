'use client'

import { useEffect, useState } from 'react'
import { CartItem } from '@/types/cart'

interface AddressForm {
  city: string;
  cityCode: number;
  district: string;
  districtCode: number;
  ward: string;
  wardCode: number;
  address: string;
}

interface Carrier {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
}

interface Province {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}

interface District {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
}

interface Ward {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  district_code: number;
}

interface ShippingInfoProps {
  addressForm: AddressForm;
  setAddressForm: (info: AddressForm | ((prev: AddressForm) => AddressForm)) => void;
  selectedCarrier: string;
  setSelectedCarrier: (carrier: string) => void;
  carriers: Carrier[];
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  loadingProvinces: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  showAddressDrawer: boolean;
  setShowAddressDrawer: (show: boolean) => void;
  showShippingDrawer: boolean;
  setShowShippingDrawer: (show: boolean) => void;
  fetchDistricts: (provinceCode: number) => Promise<void>;
  fetchWards: (districtCode: number) => Promise<void>;
  note: string;
  setNote: (note: string) => void;
  cartItems: CartItem[];
}

export default function ShippingInfo({
  addressForm,
  setAddressForm,
  selectedCarrier,
  setSelectedCarrier,
  carriers,
  provinces,
  districts,
  wards,
  loadingProvinces,
  loadingDistricts,
  loadingWards,
  showAddressDrawer,
  setShowAddressDrawer,
  showShippingDrawer,
  setShowShippingDrawer,
  fetchDistricts,
  fetchWards,
  note,
  setNote,
  cartItems,
}: ShippingInfoProps) {

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium">Thông tin giao hàng</div>
          <div className="text-green-600 text-sm mt-1">Freeship toàn quốc - Nội thành HN, HCM trong ngày, liên tỉnh 2-3 ngày</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            id="city"
            value={addressForm.cityCode || ''}
            onChange={(e) => {
              const code = Number(e.target.value)
              const selectedProvince = provinces.find(p => p.code === code)
              if (selectedProvince) {
                setAddressForm({ 
                  ...addressForm, 
                  city: selectedProvince.name,
                  cityCode: selectedProvince.code,
                  district: '',
                  districtCode: 0,
                  ward: '',
                  wardCode: 0
                })
                fetchDistricts(selectedProvince.code)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={loadingProvinces}
          >
            <option value="">Chọn Tỉnh/Thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
            Quận/Huyện <span className="text-red-500">*</span>
          </label>
          <select
            id="district"
            value={addressForm.districtCode || ''}
            onChange={(e) => {
              const code = Number(e.target.value)
              const selectedDistrict = districts.find(d => d.code === code)
              if (selectedDistrict) {
                setAddressForm({ 
                  ...addressForm, 
                  district: selectedDistrict.name,
                  districtCode: selectedDistrict.code,
                  ward: '',
                  wardCode: 0
                })
                fetchWards(selectedDistrict.code)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={!addressForm.cityCode || loadingDistricts}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
            Phường/Xã <span className="text-red-500">*</span>
          </label>
          <select
            id="ward"
            value={addressForm.wardCode || ''}
            onChange={(e) => {
              const code = Number(e.target.value)
              const selectedWard = wards.find(w => w.code === code)
              if (selectedWard) {
                setAddressForm({ 
                  ...addressForm, 
                  ward: selectedWard.name,
                  wardCode: selectedWard.code
                })
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={!addressForm.districtCode || loadingWards}
          >
            <option value="">Chọn Phường/Xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            value={addressForm.address}
            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
            placeholder="Số nhà, tên đường"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      <div className="mt-4">
        <div className="font-medium mb-2">Phương thức vận chuyển</div>
        <div className="space-y-2">
          {carriers.map((carrier) => (
            <div
              key={carrier.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCarrier === carrier.id
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-500'
              }`}
              onClick={() => setSelectedCarrier(carrier.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 border-2 rounded-full flex items-center justify-center">
                      {selectedCarrier === carrier.id && (
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">{carrier.name}</div>
                    <div className="text-sm text-gray-500">{carrier.estimatedTime}</div>
                  </div>
                </div>
                <div className="text-red-600 font-medium">
                  {carrier.price === 0 ? 'Miễn phí' : `${carrier.price.toLocaleString()}₫`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 