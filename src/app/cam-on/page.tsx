'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface OrderData {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
  order_items?: Array<{
    product_name: string;
    quantity: number;
    price: number;
    total_price: number;
    product_image?: string;
  }>;
}

export default function ThankYouPage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    // Fetch order details using secure token
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders?token=${token}`);
        const data = await response.json();
        
        if (response.ok && data.orders && data.orders.length > 0) {
          setOrderData(data.orders[0]);
        } else {
          console.error('Order not found or invalid token:', data.error);
          router.push('/?error=invalid_access');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        router.push('/?error=access_denied');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin đơn hàng.</p>
          <Link href="/" className="text-green-600 hover:text-green-700 mt-2 inline-block">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full mb-3 md:mb-4">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Cảm ơn bạn đã đặt hàng!</h1>
          <p className="text-gray-600 text-base md:text-lg px-4">
            Đơn hàng của bạn đã được tiếp nhận và đang được xử lý
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Thông tin đơn hàng
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Mã đơn hàng</p>
                  <p className="font-semibold text-green-600">#{orderData.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    {orderData.status === 'pending' ? 'Đang xử lý' : orderData.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày đặt hàng</p>
                  <p className="font-medium">
                    {new Date(orderData.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tổng tiền</p>
                  <p className="font-bold text-lg text-green-600">
                    {orderData.total_price.toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>

              {/* Order Items */}
              {orderData.order_items && orderData.order_items.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Sản phẩm đã đặt</h3>
                  <div className="space-y-3">
                    {orderData.order_items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {item.product_image && (
                          <div className="flex-shrink-0">
                            <Image
                              src={item.product_image}
                              alt={item.product_name}
                              width={50}
                              height={50}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500">
                            Số lượng: {item.quantity} × {item.price.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {item.total_price.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Thông tin giao hàng
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Người nhận</p>
                  <p className="font-medium">{orderData.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{orderData.phone}</p>
                </div>
                {orderData.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{orderData.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                  <p className="font-medium">{orderData.address}</p>
                </div>
                {orderData.note && (
                  <div>
                    <p className="text-sm text-gray-500">Ghi chú</p>
                    <p className="font-medium">{orderData.note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Các bước tiếp theo</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Xác nhận đơn hàng</p>
                    <p className="text-sm text-gray-500">Chúng tôi sẽ liên hệ để xác nhận đơn hàng trong vòng 30 phút</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Chuẩn bị hàng</p>
                    <p className="text-sm text-gray-500">Đơn hàng sẽ được chuẩn bị và đóng gói cẩn thận</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Giao hàng</p>
                    <p className="text-sm text-gray-500">Hàng sẽ được giao trong 1-3 ngày làm việc</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Hỗ trợ khách hàng</h3>
              <p className="text-green-700 text-sm mb-4">
                Cần hỗ trợ? Liên hệ với chúng tôi
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Hotline: 1900-xxxx
                </div>
                <div className="flex items-center text-green-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email: support@g3-tech.vn
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center block"
              >
                Tiếp tục mua sắm
              </Link>
              <Link
                href="/tai-khoan"
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border transition-colors text-center block"
              >
                Xem đơn hàng của tôi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 