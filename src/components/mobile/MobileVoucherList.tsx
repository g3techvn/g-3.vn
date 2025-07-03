'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

// Mock data for testing
const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'mock-newuser-2025',
    code: 'NEWUSER',
    title: 'Khách hàng mới',
    description: 'Giảm 15% cho khách hàng mới (tối đa 250K) cho đơn từ 2 triệu',
    discount_type: 'percentage' as const,
    discount_value: 15,
    min_order_value: 2000000,
    max_discount: 250000,
    usage_limit: 1000,
    used_count: 0,
    valid_from: new Date().toISOString(),
    valid_to: '2025-12-31'
  },
  {
    id: 'mock-freeship-2025',
    code: 'FREESHIP1M',
    title: 'Freeship Toàn Quốc',
    description: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 1 triệu',
    discount_type: 'shipping' as const,
    min_order_value: 1000000,
    usage_limit: 1000,
    used_count: 0,
    valid_from: new Date().toISOString(),
    valid_to: '2025-12-31',
    is_freeship: true
  },
  {
    id: 'mock-lapdat-2025',
    code: 'LAPDAT',
    title: 'Miễn phí lắp đặt',
    description: 'Miễn phí lắp đặt tại Hà Nội và HCM',
    discount_type: 'service' as const,
    min_order_value: 0,
    usage_limit: 2000,
    used_count: 0,
    valid_from: new Date().toISOString(),
    valid_to: '2025-12-31',
    is_installation: true,
    location_provinces: [1, 79] // 1 = Hà Nội, 79 = HCM
  }
];

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'fixed' | 'percentage' | 'shipping' | 'service';
  discount_value?: number;
  max_discount?: number;
  min_order_value: number;
  valid_from: string;
  valid_to: string;
  usage_limit: number | null;
  used_count: number;
  is_freeship?: boolean;
  is_installation?: boolean;
  location_provinces?: number[];
}

interface MobileVoucherListProps {
  vouchers?: Voucher[];
  isLoading: boolean;
  error: string | null;
  includeMockData?: boolean;
}

export default function MobileVoucherList({ 
  vouchers = [], 
  isLoading, 
  error,
  includeMockData = false 
}: MobileVoucherListProps) {
  const { showToast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Kết hợp dữ liệu mock với dữ liệu thật
  const displayVouchers = includeMockData 
    ? [...vouchers, ...MOCK_VOUCHERS]
    : vouchers;

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast('Đã sao chép mã voucher!', 'default');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      showToast('Không thể sao chép mã voucher', 'destructive');
    }
  };

  const formatDiscount = (voucher: Voucher) => {
    console.log('Voucher data:', voucher); // Debug log
    
    if (voucher.is_freeship) {
      return 'FREESHIP';
    }

    if (voucher.is_installation) {
      return 'MIỄN PHÍ';
    }

    // Check discount_value
    if (voucher.discount_value) {
      if (voucher.discount_type === 'fixed') {
        return `${voucher.discount_value.toLocaleString()}Đ`;
      }
      return `${voucher.discount_value}%`;
    }
    
    return 'KHUYẾN MÃI';
  };

  const getDiscountPrefix = (voucher: Voucher) => {
    if (voucher.is_freeship) {
      return 'MIỄN PHÍ';
    }
    if (voucher.is_installation) {
      return 'LẮP ĐẶT';
    }
    return 'GIẢM';
  };

  const getFullDiscountText = (voucher: Voucher) => {
    if (voucher.is_freeship) {
      return `Miễn phí vận chuyển toàn quốc`;
    }

    if (voucher.is_installation) {
      return `Miễn phí lắp đặt tại HN & HCM`;
    }

    // Check discount_value
    if (voucher.discount_value) {
      if (voucher.discount_type === 'fixed') {
        return `Giảm ${voucher.discount_value.toLocaleString()}đ`;
      }
      let text = `Giảm ${voucher.discount_value}%`;
      if (voucher.max_discount) {
        text += ` (tối đa ${voucher.max_discount.toLocaleString()}đ)`;
      }
      return text;
    }
    
    return 'Ưu đãi đặc biệt';
  };

  const getVoucherColor = (voucher: Voucher) => {
    if (voucher.is_freeship) {
      return '#10B981'; // text-emerald-500 - màu xanh lá cho freeship
    }
    if (voucher.is_installation) {
      return '#F59E0B'; // text-amber-500 - màu cam cho lắp đặt
    }
    if (voucher.discount_type === 'percentage') {
      return '#3B82F6'; // text-blue-500 - màu xanh dương cho giảm giá %
    }
    return '#EF4444'; // text-red-500 - màu đỏ cho các loại khác
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4 space-y-3 animate-pulse shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (displayVouchers.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Hiện không có voucher nào khả dụng</p>
          <p className="text-gray-500 text-sm mt-1">Hãy quay lại sau để không bỏ lỡ ưu đãi!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {displayVouchers.map((voucher) => (
        <div key={voucher.id} className="relative mb-6">
          {/* Voucher with radial-gradient serrated edges */}
          <div 
            className="voucher-ticket relative flex overflow-hidden rounded-lg shadow-lg h-32"
            style={{
              filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3))',
              position: 'relative'
            }}
          >
            {/* Left section - Discount */}
            <div 
              className="flex items-center justify-center w-32 text-white relative border-r-2 border-dashed border-gray-300"
              style={{
                backgroundImage: `radial-gradient(
                  circle at 0% 50%,
                  transparent 12px,
                  ${getVoucherColor(voucher)} 13px
                )`
              }}
            >
              {/* Dotted pattern background */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id={`dots-${voucher.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="1.5" fill="white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#dots-${voucher.id})`} />
                </svg>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="text-xs font-bold mb-1 opacity-90">{getDiscountPrefix(voucher)}</div>
                <div className="text-xl font-black leading-none mb-1">{formatDiscount(voucher)}</div>
                <div className="text-xs font-bold opacity-90">OFF</div>
              </div>
            </div>

            {/* Center section - Main content */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center text-center p-4 relative border-r-2 border-dashed border-gray-300">
              {/* Background pattern */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <pattern id={`pattern-${voucher.id}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                      <rect x="0" y="0" width="2" height="10" fill="currentColor" />
                      <rect x="0" y="0" width="10" height="2" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill={`url(#pattern-${voucher.id})`} />
                </svg>
              </div>

              <div className="relative z-10 w-full">
                {/* Voucher title */}
                <h3 className={`text-sm font-bold text-gray-800 leading-tight mb-1 uppercase ${
                  (voucher.is_freeship || voucher.is_installation) ? 'text-xs' : ''
                }`}>
                  {voucher.title || 'VOUCHER KHUYẾN MÃI'}
                </h3>
                
                {/* Discount amount prominently displayed */}
                <div className="bg-black text-yellow-400 px-2 py-1 rounded text-xs font-bold mb-2 inline-block uppercase">
                  {getFullDiscountText(voucher)}
                </div>
                
                {/* Voucher details */}
                <div className="text-xs text-gray-500 space-y-1">
                  {voucher.min_order_value > 0 && (
                    <div>Đơn tối thiểu: {voucher.min_order_value.toLocaleString()}đ</div>
                  )}
                  {voucher.valid_to && (
                    <div className="text-xs font-semibold uppercase tracking-wider">
                      HSD: {new Date(voucher.valid_to).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right section - Voucher code */}
            <div 
              className="w-16 flex items-center justify-center text-center relative"
              style={{
                backgroundImage: `radial-gradient(
                  circle at 100% 50%,
                  transparent 12px,
                  #ffffff 13px
                )`
              }}
            >
              <button
                onClick={() => handleCopyCode(voucher.code || 'NO_CODE')}
                className={`relative z-10 p-1.5 transition-all duration-200 ${
                  copiedCode === voucher.code
                    ? 'text-green-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                style={{
                  transform: 'rotate(-90deg)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px'
                }}
              >
                {copiedCode === voucher.code ? (
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    COPIED
                  </div>
                ) : (
                  voucher.code || 'NO_CODE'
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 