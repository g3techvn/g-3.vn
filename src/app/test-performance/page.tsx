import { Metadata } from 'next';
import PerformanceDashboard from '@/components/admin/PerformanceDashboard';

export const metadata: Metadata = {
  title: 'Performance Test | G3',
  description: 'Performance monitoring test dashboard',
  robots: 'noindex,nofollow',
};

export default function TestPerformancePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Performance Dashboard Test</h1>
      <PerformanceDashboard />
    </div>
  );
} 