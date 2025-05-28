'use client';

import { BuyerInfoProps } from '@/types/cart';
import { Dispatch, SetStateAction } from 'react';

interface ExtendedBuyerInfoProps extends BuyerInfoProps {
  setGuestInfo: Dispatch<SetStateAction<{
    fullName: string;
    phone: string;
    email: string;
  }>>;
  setUserPhone: Dispatch<SetStateAction<string>>;
  setErrors: Dispatch<SetStateAction<{
    fullName: string;
    phone: string;
  }>>;
}

export default function BuyerInfo({
  user,
  guestInfo,
  setGuestInfo,
  userPhone,
  setUserPhone,
  errors,
  setErrors
}: ExtendedBuyerInfoProps) {
  const validateField = (name: string, value: string) => {
    if (name === 'fullName') {
      if (!value.trim()) {
        return 'Vui lòng nhập họ tên';
      }
    }
    if (name === 'phone') {
      if (!value.trim()) {
        return 'Vui lòng nhập số điện thoại';
      }
      // Basic Vietnamese phone number validation
      if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(value.trim())) {
        return 'Số điện thoại không hợp lệ';
      }
    }
    return '';
  };

  const handleGuestInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate required fields on change
    if (name === 'fullName' || name === 'phone') {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUserPhone(value);
    setErrors(prev => ({
      ...prev,
      phone: validateField('phone', value)
    }));
  };

  return (
    <>
      <div className="flex items-center mb-3 mt-6">
        <div className="w-8 h-8 mr-2">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#DC2626"/>
          </svg>
        </div>
        <span className="text-lg font-medium">Thông tin người mua</span>
      </div>
      
      <div className="bg-white p-4 rounded-md">
        {user ? (
          // Logged in user information display
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-gray-800 font-medium">{user.name}</div>
                <div className="text-gray-500 text-sm">{user.email}</div>
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={userPhone}
                onChange={handlePhoneChange}
                className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500`}
                placeholder="Nhập số điện thoại của bạn"
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>
        ) : (
          // Guest user input form
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={guestInfo.fullName}
                onChange={handleGuestInfoChange}
                className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500`}
                placeholder="Nhập họ và tên của bạn"
                required
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={guestInfo.phone}
                onChange={handleGuestInfoChange}
                className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500`}
                placeholder="Nhập số điện thoại của bạn"
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={guestInfo.email}
                onChange={handleGuestInfoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Nhập địa chỉ email của bạn"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
} 