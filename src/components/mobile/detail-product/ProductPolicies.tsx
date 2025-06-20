import React from 'react';
import { ArrowPathIcon, ShieldCheckIcon, TruckIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export function ProductPolicies() {
  return (
    <div className="px-4 pt-0 pb-2">
      <h2 className="text-lg font-semibold mb-2 text-red-700">Chính sách mua hàng tại G3-TECH</h2>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex items-start gap-3">
          <ArrowPathIcon className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <span className="font-medium text-gray-800">1 đổi 1 chi tiết lỗi trong 15 ngày</span>
            <div className="text-xs text-gray-500">nếu lỗi do nhà sản xuất</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <span className="font-medium text-gray-800">Bảo hành phần cơ khí 12 tháng, lưới 6 tháng</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <TruckIcon className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <span className="font-medium text-gray-800">Vận chuyển toàn quốc, nhận hàng kiểm tra trước khi thanh toán</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <WrenchScrewdriverIcon className="w-6 h-6 text-red-600 mt-0.5" />
          <div>
            <span className="font-medium text-gray-800">Miễn phí lắp đặt tại Hà Nội và TP. Hồ Chí Minh</span>
          </div>
        </div>
      </div>
    </div>
  );
} 