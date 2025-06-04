'use client'

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

interface ShippingInfoProps {
  addressForm: AddressForm;
  setAddressForm: (info: AddressForm | ((prev: AddressForm) => AddressForm)) => void;
  selectedCarrier: string;
  setSelectedCarrier: (carrier: string) => void;
  carriers: Carrier[];
  cities: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  wards: { id: number; name: string }[];
  loadingCities: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  showAddressDrawer: boolean;
  setShowAddressDrawer: (show: boolean) => void;
  showShippingDrawer: boolean;
  setShowShippingDrawer: (show: boolean) => void;
  fetchDistricts: (cityId: number) => Promise<void>;
  fetchWards: (districtId: number) => Promise<void>;
  note: string;
  setNote: (note: string) => void;
}

export default function ShippingInfo({
  addressForm,
  setAddressForm,
  selectedCarrier,
  setSelectedCarrier,
  carriers,
  cities,
  districts,
  wards,
  loadingCities,
  loadingDistricts,
  loadingWards,
  showAddressDrawer,
  setShowAddressDrawer,
  showShippingDrawer,
  setShowShippingDrawer,
  fetchDistricts,
  fetchWards,
  note,
  setNote
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
              const cityId = Number(e.target.value)
              setAddressForm({ ...addressForm, city: e.target.value })
              fetchDistricts(cityId)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={loadingCities}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
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
              const districtId = Number(e.target.value)
              setAddressForm({ ...addressForm, district: e.target.value })
              fetchWards(districtId)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={loadingDistricts || !addressForm.city}
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
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
              <option key={ward.id} value={ward.id}>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Nhập địa chỉ chi tiết"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
          placeholder="Nhập ghi chú (không bắt buộc)"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phương thức vận chuyển <span className="text-red-500">*</span>
        </label>
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
      </div>
    </div>
  )
} 