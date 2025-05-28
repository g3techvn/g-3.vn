'use client';

import { Drawer } from 'antd';
import { Voucher } from '@/types/cart';

interface VoucherInfoProps {
  showVoucherDrawer: boolean;
  setShowVoucherDrawer: (show: boolean) => void;
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  selectedVoucher: Voucher | null;
  setSelectedVoucher: (voucher: Voucher | null) => void;
  availableVouchers: Voucher[];
  totalPrice: number;
}

export default function VoucherInfo({
  showVoucherDrawer,
  setShowVoucherDrawer,
  voucherCode,
  setVoucherCode,
  selectedVoucher,
  setSelectedVoucher,
  availableVouchers,
  totalPrice
}: VoucherInfoProps) {
  return (
    <>
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
        <div className="py-3 flex items-center cursor-pointer" onClick={() => setShowVoucherDrawer(true)}>
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            {selectedVoucher ? (
              <>
                <div className="text-red-600 font-medium mb-0.5">Đã áp dụng: {selectedVoucher.code}</div>
                <div className="text-gray-500 text-sm">Giảm {selectedVoucher.discountAmount.toLocaleString()}đ</div>
              </>
            ) : (
              <>
                <div className="text-yellow-600 font-medium mb-0.5">Chưa áp dụng <span className="text-gray-500 text-sm">(chọn hoặc nhập mã)</span></div>
                <div className="text-red-600 text-sm">Có {availableVouchers.length} voucher có thể áp dụng</div>
                <div className="text-gray-500 text-sm">Voucher của G3-TECH</div>
              </>
            )}
          </div>
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>

        {/* Voucher Drawer */}
        <Drawer
          title="Chọn Voucher"
          placement="bottom"
          onClose={() => setShowVoucherDrawer(false)}
          open={showVoucherDrawer}
          height="auto"
          className="voucher-drawer"
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
            {/* Voucher Code Input */}
            <div>
              <label htmlFor="voucherCode" className="block text-sm font-medium text-gray-700 mb-1">
                Mã Voucher
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="voucherCode"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 uppercase"
                  placeholder="Nhập mã voucher"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                />
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!voucherCode.trim()}
                  onClick={() => {
                    const foundVoucher = availableVouchers.find(v => v.code === voucherCode);
                    if (foundVoucher) {
                      setSelectedVoucher(foundVoucher);
                      setShowVoucherDrawer(false);
                    } else {
                      alert('Mã voucher không hợp lệ hoặc đã hết hạn');
                    }
                    setVoucherCode('');
                  }}
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Available Vouchers */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Voucher có sẵn ({availableVouchers.length})
              </div>
              <div className="space-y-3">
                {availableVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className={`p-4 rounded-lg border ${selectedVoucher?.id === voucher.id ? 'border-red-500 bg-red-50' : 'border-gray-200'} cursor-pointer`}
                    onClick={() => {
                      if (totalPrice >= voucher.minOrderValue) {
                        setSelectedVoucher(voucher);
                        setShowVoucherDrawer(false);
                      } else {
                        alert(`Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-red-600">{voucher.title}</div>
                      <div className="text-sm text-gray-500">HSD: {new Date(voucher.expiryDate).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-gray-600">{voucher.description}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Đơn tối thiểu {voucher.minOrderValue.toLocaleString()}đ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Drawer>
      </div>
    </>
  );
} 