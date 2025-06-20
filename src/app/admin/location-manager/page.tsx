import { Metadata } from 'next';
import LocationManager from '@/components/admin/LocationManager';

export const metadata: Metadata = {
  title: 'Quản lý Địa điểm - Admin | G3',
  description: 'Quản lý dữ liệu tỉnh thành, quận huyện, phường xã từ API provinces.open-api.vn',
  robots: 'noindex, nofollow',
};

export default function LocationManagerPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <LocationManager />
    </div>
  );
} 