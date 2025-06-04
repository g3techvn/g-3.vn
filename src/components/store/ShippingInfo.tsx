'use client'

import { useEffect, useState, useCallback } from 'react'
import { calculateShippingFee, type GHNShippingFeeRequest } from '@/services/ghn'
import { CartItem } from '@/types/cart'

interface AddressForm {
  city: string;
  district: string;
  ward: string;
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
  onShippingFeeCalculated?: (fee: number) => void;
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
  onShippingFeeCalculated
}: ShippingInfoProps) {
  const [calculatingFee, setCalculatingFee] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)

  const calculatePackageDetails = useCallback(() => {
    // Calculate total weight and dimensions based on cart items
    const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 0), 0);
    const maxLength = Math.max(...cartItems.map(item => item.length || 0));
    const maxWidth = Math.max(...cartItems.map(item => item.width || 0));
    const maxHeight = Math.max(...cartItems.map(item => item.height || 0));

    return {
      weight: totalWeight,
      length: maxLength,
      width: maxWidth,
      height: maxHeight,
      items: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        weight: item.weight || 0,
        length: item.length || 0,
        width: item.width || 0,
        height: item.height || 0
      }))
    };
  }, [cartItems]);

  // Calculate shipping fee when address is complete
  useEffect(() => {
    const calculateFee = async () => {
      if (!addressForm.district || !addressForm.ward) return

      try {
        setCalculatingFee(true)
        setShippingError(null)

        const packageDetails = calculatePackageDetails()
        const request: GHNShippingFeeRequest = {
          service_type_id: 2, // Standard delivery
          from_district_id: 1442, // Your shop's district ID
          from_ward_code: "21211", // Your shop's ward code
          to_district_id: parseInt(addressForm.district),
          to_ward_code: addressForm.ward,
          weight: packageDetails.weight,
          length: packageDetails.length,
          width: packageDetails.width,
          height: packageDetails.height,
          insurance_value: 0, // Set insurance value if needed
          items: packageDetails.items
        }

        const response = await calculateShippingFee(request)
        if (response.code === 200 && response.data) {
          onShippingFeeCalculated?.(response.data.total)
          // Update carriers with calculated fee
          const updatedCarriers = carriers.map(carrier => {
            if (carrier.id === 'ghn') {
              return {
                ...carrier,
                price: response.data.total,
                estimatedTime: '2-3 ngày'
              }
            }
            return carrier
          })
          // Update carriers state here if needed
        }
      } catch (error) {
        console.error('Error calculating shipping fee:', error)
        setShippingError('Không thể tính phí vận chuyển. Vui lòng thử lại sau.')
      } finally {
        setCalculatingFee(false)
      }
    }

    calculateFee()
  }, [addressForm.district, addressForm.ward, cartItems, calculatePackageDetails, carriers, onShippingFeeCalculated])

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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            Tỉnh/Thành phố <span className="text-red-500">*</span>
          </label>
          <select
            id="city"
            value={addressForm.city}
            onChange={(e) => {
              const provinceCode = Number(e.target.value)
              setAddressForm({ ...addressForm, city: e.target.value, district: '', ward: '' })
              fetchDistricts(provinceCode)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={loadingProvinces}
          >
            <option value="">Chọn tỉnh/thành phố</option>
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
            value={addressForm.district}
            onChange={(e) => {
              const districtCode = Number(e.target.value)
              setAddressForm({ ...addressForm, district: e.target.value, ward: '' })
              fetchWards(districtCode)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={loadingDistricts || !addressForm.city}
          >
            <option value="">Chọn quận/huyện</option>
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
            value={addressForm.ward}
            onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={loadingWards || !addressForm.district}
          >
            <option value="">Chọn phường/xã</option>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phương thức vận chuyển <span className="text-red-500">*</span>
        </label>
        {calculatingFee ? (
          <div className="text-gray-500 text-sm">Đang tính phí vận chuyển...</div>
        ) : shippingError ? (
          <div className="text-red-500 text-sm">{shippingError}</div>
        ) : (
          <div className="space-y-2">
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className={`p-4 border rounded-md cursor-pointer ${
                  selectedCarrier === carrier.id ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedCarrier(carrier.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{carrier.name}</div>
                    <div className="text-sm text-gray-500">Dự kiến giao hàng: {carrier.estimatedTime}</div>
                  </div>
                  <div className="text-red-600 font-medium">{carrier.price.toLocaleString()}đ</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 