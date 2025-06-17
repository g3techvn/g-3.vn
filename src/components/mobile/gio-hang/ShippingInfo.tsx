'use client';

import { ShippingInfoProps } from '@/types/cart';
import { Dispatch, SetStateAction } from 'react';
import { Drawer } from 'antd';

interface ExtendedShippingInfoProps extends ShippingInfoProps {
  setAddressForm: Dispatch<SetStateAction<{
    city: string;
    district: string;
    ward: string;
    address: string;
  }>>;
  setSelectedCarrier: Dispatch<SetStateAction<string>>;
  setShowAddressDrawer: Dispatch<SetStateAction<boolean>>;
  setShowShippingDrawer: Dispatch<SetStateAction<boolean>>;
  setNote: Dispatch<SetStateAction<string>>;
  fetchDistricts: (cityCode: number) => Promise<void>;
  fetchWards: (districtCode: number) => Promise<void>;
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
}: ExtendedShippingInfoProps) {
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityCode = Number(e.target.value);
    const cityName = e.target.options[e.target.selectedIndex].text;
    setAddressForm(prev => ({ ...prev, city: cityName, district: '', ward: '' }));
    if (cityCode) {
      fetchDistricts(cityCode);
    } else {
      setAddressForm(prev => ({ ...prev, district: '', ward: '' }));
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = Number(e.target.value);
    const districtName = e.target.options[e.target.selectedIndex].text;
    setAddressForm(prev => ({ ...prev, district: districtName, ward: '' }));
    if (districtCode) {
      fetchWards(districtCode);
    } else {
      setAddressForm(prev => ({ ...prev, ward: '' }));
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardName = e.target.options[e.target.selectedIndex].text;
    setAddressForm(prev => ({ ...prev, ward: wardName }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddressForm(prev => ({ ...prev, address: newAddress }));
  };

  return (
    <>
      <div className="flex items-center mb-3 mt-6">
        <div className="w-8 h-8 mr-2">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect width="24" height="24" rx="12" fill="#DC2626" opacity="0.1"/>
            <path d="M5 18h14v2H5v-2zm4.5-11a2 2 0 00-2 2v7h9v-7a2 2 0 00-2-2h-5z" fill="#DC2626" opacity="0.7"/>
            <path d="M16 11l-4-4-4 4v7h8v-7z" fill="#DC2626" opacity="0.4"/>
          </svg>
        </div>
        <span className="text-lg font-medium">Thông tin vận chuyển</span>
      </div>
      <div className="text-green-600 text-sm mb-4">Freeship toàn quốc - Nội thành HN, HCM trong ngày, liên tỉnh 2-3 ngày</div>
      
      <div className="bg-white p-4 rounded-md">
        {/* Address information */}
        <div className="py-3 flex items-center cursor-pointer" onClick={() => setShowAddressDrawer(true)}>
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            {addressForm.city && addressForm.district && addressForm.ward && addressForm.address ? (
              <>
                <div className="text-gray-800 font-medium mb-0.5">Địa chỉ giao hàng</div>
                <div className="text-gray-600 text-sm">{`${addressForm.address}, ${addressForm.ward}, ${addressForm.district}, ${addressForm.city}`}</div>
              </>
            ) : (
              <>
                <div className="text-red-500 font-medium mb-0.5">Bạn chưa có thông tin địa chỉ</div>
                <div className="text-gray-500 text-sm">Bấm vào đây để thêm địa chỉ</div>
              </>
            )}
          </div>
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-2"></div>

        {/* Shipping Carrier Selection */}
        <div className="py-3 flex items-center cursor-pointer" onClick={() => setShowShippingDrawer(true)}>
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            {selectedCarrier ? (
              <>
                <div className="text-gray-800 font-medium mb-0.5">
                  {carriers.find(c => c.id === selectedCarrier)?.name}
                </div>
                <div className="text-gray-500 text-sm">
                  {carriers.find(c => c.id === selectedCarrier)?.time} - {carriers.find(c => c.id === selectedCarrier)?.price.toLocaleString()}đ
                </div>
              </>
            ) : (
              <>
                <div className="text-red-500 font-medium mb-0.5">Chọn đơn vị vận chuyển</div>
                <div className="text-gray-500 text-sm">Bấm vào đây để chọn đơn vị vận chuyển</div>
              </>
            )}
          </div>
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>

        {/* Address Drawer */}
        <Drawer
          title="Thông tin địa chỉ"
          placement="bottom"
          onClose={() => setShowAddressDrawer(false)}
          open={showAddressDrawer}
          height="auto"
          className="address-drawer"
          styles={{
            body: {
              padding: '16px 24px',
              paddingBottom: '100px'
            },
            mask: {
              background: 'rgba(0, 0, 0, 0.45)'
            }
          }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                value={cities.find(city => city.name === addressForm.city)?.code || ''}
                onChange={handleCityChange}
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {cities.map(city => (
                  <option key={city.code} value={city.code}>{city.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <select
                id="district"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                value={districts.find(district => district.name === addressForm.district)?.code || ''}
                onChange={handleDistrictChange}
                disabled={!addressForm.city}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map(district => (
                  <option key={district.code} value={district.code}>{district.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ward" className="block text-sm font-medium text-gray-700 mb-1">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <select
                id="ward"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                value={wards.find(ward => ward.name === addressForm.ward)?.code || ''}
                onChange={handleWardChange}
                disabled={!addressForm.district}
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map(ward => (
                  <option key={ward.code} value={ward.code}>{ward.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ cụ thể <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Số nhà, tên đường..."
                value={addressForm.address}
                onChange={handleAddressChange}
              />
            </div>
          </div>
        </Drawer>

        {/* Shipping Carrier Drawer */}
        <Drawer
          title="Chọn đơn vị vận chuyển"
          placement="bottom"
          onClose={() => setShowShippingDrawer(false)}
          open={showShippingDrawer}
          height="auto"
          className="shipping-drawer"
          styles={{
            body: {
              padding: '16px 24px',
              paddingBottom: '100px'
            },
            mask: {
              background: 'rgba(0, 0, 0, 0.45)'
            }
          }}
        >
          <div className="space-y-4">
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className={`p-4 rounded-lg border ${selectedCarrier === carrier.id ? 'border-red-500 bg-red-50' : 'border-gray-200'} cursor-pointer`}
                onClick={() => {
                  setSelectedCarrier(carrier.id);
                  setShowShippingDrawer(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{carrier.name}</div>
                    <div className="text-sm text-gray-500 mt-1">Thời gian giao hàng: {carrier.time}</div>
                  </div>
                  <div className="text-red-600 font-medium">{carrier.price.toLocaleString()}đ</div>
                </div>
              </div>
            ))}
          </div>
        </Drawer>

        {/* Divider */}
        <div className="border-t border-gray-100 my-2"></div>

        {/* Delivery time */}
        <div className="py-3 flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-red-600 font-medium mb-0.5">Ngày 24 Th05 - Ngày 25 Th05</div>
            <div className="text-gray-500 text-sm">Thời gian nhận hàng dự kiến</div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-2"></div>

        {/* Note input */}
        <div className="py-3 flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              className="w-full px-0 text-gray-500 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>
    </>
  );
} 