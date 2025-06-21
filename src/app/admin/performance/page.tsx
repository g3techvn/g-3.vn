import { Metadata } from 'next';
import PerformanceDashboard from '@/components/admin/PerformanceDashboard';

export const metadata: Metadata = {
  title: 'Performance Dashboard | G3 Admin',
  description: 'Real-time web vitals and performance monitoring dashboard',
  robots: 'noindex,nofollow',
};

export default function PerformancePage() {
  return (
            <div>
      <PerformanceDashboard />
    </div>
  );
} 