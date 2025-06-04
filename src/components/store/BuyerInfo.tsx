'use client'

interface BuyerInfoProps {
  user: {
    fullName: string;
    email: string;
  } | null;
  guestInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  setGuestInfo: (info: {
    fullName: string;
    phone: string;
    email: string;
  } | ((prev: {
    fullName: string;
    phone: string;
    email: string;
  }) => {
    fullName: string;
    phone: string;
    email: string;
  })) => void;
  userPhone: string;
  setUserPhone: (phone: string) => void;
  errors: {
    fullName: string;
    phone: string;
  };
  setErrors: (errors: { fullName: string; phone: string }) => void;
}

export default function BuyerInfo({
  user,
  guestInfo,
  setGuestInfo,
  userPhone,
  setUserPhone,
  errors,
  setErrors
}: BuyerInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium">Thông tin người mua</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            value={guestInfo.fullName}
            onChange={(e) => {
              setGuestInfo({ ...guestInfo, fullName: e.target.value })
              if (errors.fullName) {
                setErrors({ ...errors, fullName: '' })
              }
            }}
            className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500`}
            placeholder="Nhập họ và tên"
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
            value={guestInfo.phone}
            onChange={(e) => {
              setGuestInfo({ ...guestInfo, phone: e.target.value })
              setUserPhone(e.target.value)
              if (errors.phone) {
                setErrors({ ...errors, phone: '' })
              }
            }}
            className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-red-500`}
            placeholder="Nhập số điện thoại"
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
            value={guestInfo.email}
            onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Nhập email"
          />
        </div>
      </div>
    </div>
  )
} 