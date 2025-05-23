'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  
  const shipping = 30000;
  const total = totalPrice + shipping;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-3 flex items-center sticky top-0 z-10">
        <Link href="/" className="absolute left-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-medium text-gray-800">Giỏ hàng</h1>
        </div>
        <button className="absolute right-3 p-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </button>
      </header>

      <div className="px-4 pb-20 max-w-full overflow-hidden">
        {/* Products section */}
        <div className="flex items-center mb-3 mt-4">
          <div className="w-8 h-8 mr-2">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M4.5 3.75a3 3 0 013-3h9a3 3 0 013 3v.75H4.5v-.75z" fill="#DC2626" />
              <path d="M21.75 9.75H2.25V19.5a3 3 0 003 3h13.5a3 3 0 003-3V9.75z" fill="#DC2626" opacity="0.3" />
              <path d="M21.75 4.5H2.25v5.25h19.5V4.5z" fill="#DC2626" opacity="0.6" />
            </svg>
          </div>
          <span className="text-lg font-medium">Sản phẩm đặt mua</span>
        </div>
        
        <div className="bg-white p-4 rounded-md">
          {loading ? (
            <div className="py-3 flex items-center">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800 animate-spin">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-gray-500">Đang tải...</div>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="py-3 flex items-center">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-gray-500">Giỏ hàng của bạn đang trống</div>
                <div className="mt-3">
                  <Link
                    href="/"
                    className="inline-block rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-red-700"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {cartItems.map((item, index) => (
                <div key={item.id}>
                  <div className="py-3 flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-14 h-14 rounded-md overflow-hidden">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          width={56} 
                          height={56} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 mb-1">{item.name}</h3>
                      <div className="text-red-600 font-medium">{item.price.toLocaleString()}đ <span className="text-sm text-gray-500">x{item.quantity}</span></div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="flex-shrink-0"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                  {index < cartItems.length - 1 && <div className="border-t border-gray-100 my-2"></div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipping information */}
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
        
        <div className="bg-white p-4 rounded-md">
          {/* Address information */}
          <div className="py-3 flex items-center">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-800">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-red-500 font-medium mb-0.5">Bạn chưa có thông tin địa chỉ</div>
              <div className="text-gray-500 text-sm">Bấm vào đây bạn nhé</div>
            </div>
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Delivery time */}
          <div className="py-3 flex items-center">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <div className="text-gray-500 text-sm">Nhập ghi chú...</div>
            </div>
          </div>
        </div>

        {/* Voucher information */}
        <div className="flex items-center mb-3 mt-6">
          <div className="w-8 h-8 mr-2">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M21.41 11.58l-9-9C12.04 2.21 11.53 2 11 2H4C2.9 2 2 2.9 2 4v7c0 .53.21 1.04.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill="#DC2626"/>
            </svg>
          </div>
          <span className="text-lg font-medium">Thông tin voucher</span>
        </div>
        
        <div className="bg-white p-4 rounded-md">

          {/* Voucher Selection */}
          <div className="py-3 flex items-center">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-yellow-600 font-medium mb-0.5">Chưa áp dụng <span className="text-gray-500 text-sm">(chọn hoặc nhập mã)</span></div>
              <div className="text-red-600 text-sm">Có 1 voucher có thể áp dụng</div>
              <div className="text-gray-500 text-sm">Voucher của G3-TECH</div>
            </div>
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Payment details */}
        <div className="flex items-center mb-3 mt-6">
          <div className="w-8 h-8 mr-2">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.93.82 1.62 2.02 1.62 1.19 0 1.78-.6 1.78-1.53 0-.9-.59-1.46-2.05-1.87-1.77-.46-3.19-1.29-3.19-3.06 0-1.63 1.32-2.71 3.11-3.06V5h2.67v1.8c1.71.39 2.73 1.71 2.83 3.24h-2.1c-.1-.92-.71-1.52-1.74-1.52-.93 0-1.65.47-1.65 1.39 0 .84.58 1.26 2.01 1.67 1.8.51 3.29 1.29 3.29 3.19 0 1.77-1.39 2.83-3.1 3.16z" fill="#DC2626"/>
            </svg>
          </div>
          <span className="text-lg font-medium">Chi tiết thanh toán</span>
        </div>
        
        <div className="bg-white p-4 rounded-md">

          {/* Order Summary */}
          <div className="py-2">
            {/* Total Product Price */}
            <div className="flex py-3 border-b border-gray-100">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-red-600 font-medium ">{totalPrice.toLocaleString()}đ</div>
                <div className="text-gray-500 text-sm mt-1">Tổng tiền hàng</div>
              </div>
            </div>
            
            {/* Shipping Fee */}
            <div className="flex py-3 border-b border-gray-100">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                    <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div>
                  <div className="text-red-600 font-medium">{shipping.toLocaleString()}đ</div>
                  <div className="text-gray-500 text-sm mt-1">Phí vận chuyển</div>
                </div>
                <div className="text-yellow-600 text-sm mt-1">(Mua thêm 90.000đ để miễn phí vận chuyển)</div>
                <div className="mt-2 inline-block border border-red-500 text-red-600 text-left rounded-md text-sm px-2 py-1">
                  Giảm 30k phí vận chuyển đơn từ 200k
                </div>
              </div>
            </div>
            
            {/* Reward Points */}
            <div className="flex py-3 border-b border-gray-100">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-red-600 font-medium ">Sử dụng 50 điểm thưởng</div>
                  <div className="text-gray-500 text-sm mt-1">Giảm 5.000đ hoặc tích lũy để đổi quà</div>
                </div>
                <div className="w-12 h-6 bg-gray-300 rounded-full flex items-center p-1">
                  <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Voucher Discount */}
            <div className="flex py-3 border-b border-gray-100">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-red-600 font-medium ">0đ</div>
                <div className="text-gray-500 text-sm mt-1">Tổng cộng voucher giảm giá</div>
              </div>
            </div>
            
            {/* Reward Points Earned */}
            <div className="flex py-3 border-b border-gray-100">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div>
                  <div className="text-red-600 font-medium ">14 điểm thưởng</div>
                </div>
                <div className="text-gray-500 text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Nhận điểm thưởng khi đơn hàng thành công
                </div>
              </div>
            </div>
            
            {/* Payment Methods Section */}
            <div className="border-t border-gray-100 my-4 pt-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Các phương thức thanh toán:</div>
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <div className="w-16 h-16 p-2 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600 mb-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                  <span className="text-xs text-gray-600">COD</span>
                </div>
                <div className="w-16 h-16 p-2 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 mb-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                  </svg>
                  <span className="text-xs text-gray-600">Ngân hàng</span>
                </div>
                <div className="w-16 h-16 p-2 flex flex-col items-center">
                  <Image src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-MoMo-Square.png" alt="Momo" width={32} height={32} className="w-8 h-8 object-contain mb-1" />
                  <span className="text-xs text-gray-600">Momo</span>
                </div>
              </div>
              
              <p className="flex items-center text-gray-600 text-sm mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Hỗ trợ đầy đủ các phương thức thanh toán như:
              </p>
              <p className="text-yellow-600 font-medium mb-3">COD, chuyển khoản tài khoản ngân hàng và Momo</p>
              <p className="text-gray-500 text-xs mb-5">(*) Lựa chọn phương thức thanh toán sau khi đặt hàng</p>
              
              <p className="text-gray-500 text-xs">Bằng việc tiến hành đặt hàng, bạn đồng ý với điều kiện và điều khoản sử dụng của Công ty Cổ phần công nghệ G3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex justify-between items-center z-[9999] shadow-lg">
        <div className="flex flex-col justify-center h-full">
          <div className="text-gray-500 text-[10px] leading-tight">{cartItems.length} sản phẩm</div>
          <div className="text-gray-500 text-[10px] leading-tight">Tổng thanh toán</div>
          <div className="text-base font-bold leading-tight">{total.toLocaleString()}đ</div>
        </div>
        <button className="bg-[#DC2626] text-white px-8 rounded-full font-medium flex items-center h-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          Đặt hàng
        </button>
      </div>
    </div>
  );
} 