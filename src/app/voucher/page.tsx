'use client';

import { useEffect, useState } from 'react';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import MobileVoucherList from '@/components/mobile/MobileVoucherList';

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

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch('/api/vouchers');
        if (!response.ok) {
          throw new Error('Failed to fetch vouchers');
        }
        const data = await response.json();
        setVouchers(data.vouchers || []);
      } catch (err) {
        console.error('Error fetching vouchers:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách voucher');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  return (
    <>
      <div className="block md:hidden">
        <MobileHomeHeader />
        <MobileVoucherList
          vouchers={vouchers}
          isLoading={isLoading}
          error={error}
          includeMockData={true}
        />
      </div>
      <div className="container mx-auto hidden md:block">
        {/* TODO: Desktop version sẽ render ở đây */}
      </div>
    </>
  );
} 