'use client'

import { useState } from 'react'
import LocationSelector from '@/components/features/cart/LocationSelector'
import { useCart } from '@/context/CartContext'

interface LocationSelection {
  provinceCode: number;
  provinceName: string;
  districtCode: number;
  districtName: string;
  wardCode: number;
  wardName: string;
}

export default function ShippingForm() {
  const { cartItems } = useCart()
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection>({
    provinceCode: 0,
    provinceName: '',
    districtCode: 0,
    districtName: '',
    wardCode: 0,
    wardName: ''
  })
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')

  // Handle location selection changes
  const handleLocationChange = {
    province: (code: number, name: string) => {
      setSelectedLocation(prev => ({
        ...prev,
        provinceCode: code,
        provinceName: name,
        districtCode: 0,
        districtName: '',
        wardCode: 0,
        wardName: ''
      }));
    },
    district: (code: number, name: string) => {
      setSelectedLocation(prev => ({
        ...prev,
        districtCode: code,
        districtName: name,
        wardCode: 0,
        wardName: ''
      }));
    },
    ward: (code: number, name: string) => {
      setSelectedLocation(prev => ({
        ...prev,
        wardCode: code,
        wardName: name
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">📍 Thông tin giao hàng</h2>
        
        <div className="space-y-4">
          <LocationSelector
            selectedProvinceCode={selectedLocation.provinceCode}
            selectedDistrictCode={selectedLocation.districtCode}
            selectedWardCode={selectedLocation.wardCode}
            onProvinceChange={handleLocationChange.province}
            onDistrictChange={handleLocationChange.district}
            onWardChange={handleLocationChange.ward}
          />
          
          {/* Address input */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ cụ thể <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, tên đường..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Shipping carrier info */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-900">Giao hàng bởi G3-Tech</h4>
                <p className="text-sm text-green-700 mt-1">
                  <span className="font-medium">Freeship toàn quốc</span> - Nội thành HN, HCM trong ngày, liên tỉnh 2-3 ngày
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú đơn hàng
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú cho đơn hàng (tùy chọn)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 