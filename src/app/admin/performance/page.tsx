'use client';

import { useEffect, useState } from 'react';
import { Card, Spin, Progress, Statistic, Alert } from 'antd';
import { TrophyOutlined, WarningOutlined, DashboardOutlined } from '@ant-design/icons';

interface PerformanceMetrics {
  totalEntries: number;
  timeRange: {
    from: string;
    to: string;
  };
  metrics: {
    [key: string]: {
      count: number;
      values: number[];
      ratings: {
        good: number;
        'needs-improvement': number;
        poor: number;
      };
      percentiles?: {
        p50: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
      };
    };
  };
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/web-vitals', {
        headers: { 'Authorization': 'Bearer admin-key' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMetricStatus = (metric: string, value: number): 'good' | 'warning' | 'error' => {
    const thresholds = {
      'LCP': { good: 2500, poor: 4000 },
      'FCP': { good: 1800, poor: 3000 },
      'CLS': { good: 0.1, poor: 0.25 },
      'TTFB': { good: 800, poor: 1800 },
      'INP': { good: 200, poor: 500 },
      'SLOW_RESOURCE': { good: 1000, poor: 3000 },
      'LONG_TASK': { good: 50, poor: 100 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'warning';
    return 'error';
  };

  const getScoreColor = (good: number, needsWork: number, poor: number): string => {
    const total = good + needsWork + poor;
    if (total === 0) return '#gray';
    
    const goodPercent = (good / total) * 100;
    if (goodPercent >= 75) return '#52c41a'; // Green
    if (goodPercent >= 50) return '#faad14'; // Orange  
    return '#f5222d'; // Red
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading performance metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert
          message="Error Loading Metrics"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={fetchMetrics}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  if (!metrics || Object.keys(metrics.metrics).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert
          message="No Performance Data"
          description="Start browsing the website to collect performance metrics."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DashboardOutlined />
            Performance Dashboard
          </h1>
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-600">
              Monitoring {metrics.totalEntries} metrics from{' '}
              {new Date(metrics.timeRange.from).toLocaleString()} to{' '}
              {new Date(metrics.timeRange.to).toLocaleString()}
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <Statistic
              title="Total Metrics"
              value={metrics.totalEntries}
              prefix={<DashboardOutlined />}
            />
          </Card>
          
          <Card>
            <Statistic
              title="Core Web Vitals"
              value={Object.keys(metrics.metrics).filter(m => 
                ['LCP', 'FCP', 'CLS', 'TTFB', 'INP'].includes(m)
              ).length}
              suffix="/ 5"
              prefix={<TrophyOutlined />}
            />
          </Card>
          
          <Card>
            <Statistic
              title="Slow Resources"
              value={metrics.metrics.SLOW_RESOURCE?.count || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
          
          <Card>
            <Statistic
              title="Long Tasks"
              value={metrics.metrics.LONG_TASK?.count || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </div>

        {/* Metrics Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(metrics.metrics).map(([metricName, data]) => {
            const { good, 'needs-improvement': needsWork, poor } = data.ratings;
            const total = good + needsWork + poor;
            const goodPercent = total > 0 ? (good / total) * 100 : 0;
            const p95 = data.percentiles?.p95 || 0;
            const status = getMetricStatus(metricName, p95);
            
            return (
              <Card 
                key={metricName}
                title={
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{metricName}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      status === 'good' ? 'bg-green-100 text-green-800' :
                      status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                }
                className="hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  {/* Rating Distribution */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Rating Distribution</span>
                      <span className="text-sm text-gray-500">{data.count} samples</span>
                    </div>
                    <Progress
                      percent={goodPercent}
                      strokeColor={getScoreColor(good, needsWork, poor)}
                      format={() => `${Math.round(goodPercent)}% Good`}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Good: {good}</span>
                      <span>Needs Work: {needsWork}</span>
                      <span>Poor: {poor}</span>
                    </div>
                  </div>

                  {/* Percentiles */}
                  {data.percentiles && (
                    <div>
                      <div className="text-sm font-medium mb-2">Performance Percentiles</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">P50</div>
                          <div>{Math.round(data.percentiles.p50)}ms</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">P90</div>
                          <div>{Math.round(data.percentiles.p90)}ms</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">P95</div>
                          <div className={`font-bold ${
                            status === 'good' ? 'text-green-600' :
                            status === 'warning' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {Math.round(data.percentiles.p95)}ms
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {metricName === 'SLOW_RESOURCE' && poor > 0 && (
                    <Alert
                      message="High Priority"
                      description={`${poor} slow resources detected. Consider image optimization and CDN usage.`}
                      type="warning"
                    />
                  )}
                  
                  {metricName === 'LCP' && p95 > 2500 && (
                    <Alert
                      message="Optimization Needed"
                      description="LCP above 2.5s. Optimize images and reduce render blocking resources."
                      type="error"
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Metrics'}
          </button>
        </div>
      </div>
    </div>
  );
} 