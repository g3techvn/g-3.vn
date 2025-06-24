'use client';

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ComponentProps } from 'react';

// Type-safe props
type LineChartProps = ComponentProps<typeof Line>;
type BarChartProps = ComponentProps<typeof Bar>;
type DoughnutChartProps = ComponentProps<typeof Doughnut>;

// Direct Chart Components
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