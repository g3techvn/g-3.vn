'use client';

import { TruckIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export function VideoProductPolicies() {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Chính sách sản phẩm</h3>
      
      <div className="space-y-3">
        <div className="flex items-start">
          <TruckIcon className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">Vận chuyển</h4>
            <p className="text-sm text-gray-600 mt-1">
              • Miễn phí vận chuyển cho đơn hàng từ 500.000đ<br />
              • Giao hàng toàn quốc trong 1-3 ngày làm việc<br />
              • Hỗ trợ giao hàng nhanh trong nội thành
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <ShieldCheckIcon className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">Bảo hành</h4>
            <p className="text-sm text-gray-600 mt-1">
              • Bảo hành chính hãng 12 tháng<br />
              • Hỗ trợ sửa chữa tại nhà<br />
              • Đổi trả miễn phí trong 30 ngày
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <ArrowPathIcon className="h-6 w-6 text-gray-400 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">Đổi trả</h4>
            <p className="text-sm text-gray-600 mt-1">
              • Đổi trả miễn phí trong 30 ngày<br />
              • Hoàn tiền 100% nếu sản phẩm không đúng mô tả<br />
              • Hỗ trợ đổi size, màu sắc
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 