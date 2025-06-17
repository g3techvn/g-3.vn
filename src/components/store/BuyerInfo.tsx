'use client'

import { useAuth } from '@/features/auth/AuthProvider'

interface BuyerInfoForm {
  fullName: string;
  phone: string;
  email: string;
}

interface BuyerInfoProps {
  formData: BuyerInfoForm;
  setFormData: (info: BuyerInfoForm | ((prev: BuyerInfoForm) => BuyerInfoForm)) => void;
  showDrawer: boolean;
  setShowDrawer: (show: boolean) => void;
}

export default function BuyerInfo({
  formData,
  setFormData,
  showDrawer,
  setShowDrawer
}: BuyerInfoProps) {
  const { user } = useAuth()
  
  // Nếu user đã đăng nhập, hiển thị thông tin readonly
  if (user) {
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
            <div className="text-xs text-green-600 mt-1">
              ✓ Sử dụng thông tin từ tài khoản đã đăng nhập
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 mb-1">
                {user.fullName}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                {user.email}
              </div>
              {user.phone && (
                <div className="text-sm text-gray-600">
                  {user.phone}
                </div>
              )}
              {!user.phone && (
                <div className="mt-2">
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                    placeholder="Nhập số điện thoại"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Số điện thoại chưa có trong tài khoản
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Nếu user chưa đăng nhập, hiển thị form nhập thông tin
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
          <div className="text-xs text-gray-500 mt-1">
            Hoặc <button onClick={() => setShowDrawer(true)} className="text-red-600 hover:text-red-700 underline">đăng nhập</button> để sử dụng thông tin có sẵn
          </div>
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
            value={formData.fullName}
            onChange={(e) => {
              setFormData({ ...formData, fullName: e.target.value })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Nhập họ và tên"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Nhập email"
          />
        </div>
      </div>
    </div>
  )
} 