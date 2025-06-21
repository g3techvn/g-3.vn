'use client';

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// ✅ Lazy load Chart.js components for bundle optimization
const Line = dynamic(
  () => import('react-chartjs-2').then(mod => ({ default: mod.Line })),
  {
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang tải biểu đồ...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

const Bar = dynamic(
  () => import('react-chartjs-2').then(mod => ({ default: mod.Bar })),
  {
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang tải biểu đồ...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

const Doughnut = dynamic(
  () => import('react-chartjs-2').then(mod => ({ default: mod.Doughnut })),
  {
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Đang tải biểu đồ...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

// Type-safe props (simplified)
type LineChartProps = any;
type BarChartProps = any;
type DoughnutChartProps = any;

// Lazy Chart Components
export const LazyLineChart = (props: LineChartProps) => {
  return <Line {...props} />;
};

export const LazyBarChart = (props: BarChartProps) => {
  return <Bar {...props} />;
};

export const LazyDoughnutChart = (props: DoughnutChartProps) => {
  return <Doughnut {...props} />;
};

// Default export for convenience
export default {
  Line: LazyLineChart,
  Bar: LazyBarChart,
  Doughnut: LazyDoughnutChart
}; 