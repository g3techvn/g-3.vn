'use client';

import { useCurrentUser } from '@/hooks/useAuth';
import RewardPointsHistory from '@/components/features/rewards/RewardPointsHistory';
import Link from 'next/link';

export default function RewardPointsPage() {
  const { data: user, isLoading: loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vui lòng đăng nhập
            </h2>
            <p className="text-gray-600 mb-8">
              Bạn cần đăng nhập để xem thông tin điểm thưởng của mình.
            </p>
            <Link
              href="/dang-nhap"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Điểm thưởng của tôi</h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi điểm thưởng tích lũy
              </p>
            </div>
            <Link
              href="/tai-khoan"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              ← Quay lại tài khoản
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* How to Earn Points */}
          <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              💡 Cách tích điểm thưởng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🛒</div>
                <div className="font-medium text-gray-900">Mua sắm</div>
                <div className="text-sm text-gray-600">
                  1 điểm cho mỗi 1,000đ chi tiêu
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-medium text-gray-900">Đăng ký mới</div>
                <div className="text-sm text-gray-600">
                  Nhận 500 điểm chào mừng
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium text-gray-900">Sử dụng điểm</div>
                <div className="text-sm text-gray-600">
                  1 điểm = 1,000đ giảm giá
                </div>
              </div>
            </div>
          </div>

          {/* Points History */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <RewardPointsHistory user={user} />
          </div>

          {/* Terms and Conditions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">
              📋 Điều khoản sử dụng điểm thưởng
            </h3>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li>• Điểm thưởng có thời hạn sử dụng 1 năm kể từ ngày tích lũy</li>
              <li>• Tối thiểu 100 điểm và tối đa 10,000 điểm có thể sử dụng cho mỗi đơn hàng</li>
              <li>• Điểm thưởng chỉ áp dụng cho các sản phẩm không khuyến mãi</li>
              <li>• Điểm thưởng không thể chuyển đổi thành tiền mặt</li>
              <li>• G3-Tech có quyền thay đổi chính sách điểm thưởng mà không cần báo trước</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 