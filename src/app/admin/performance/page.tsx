'use client';

import { useEffect, useState } from 'react';
import { Card, Spin, Progress, Statistic, Alert, Button, DatePicker, Select, Row, Col } from 'antd';
import { TrophyOutlined, WarningOutlined, DashboardOutlined, ReloadOutlined, DownloadOutlined, LineChartOutlined } from '@ant-design/icons';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('LCP');

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

  const generateTrendChart = () => {
    if (!metrics || !metrics.metrics[selectedMetric]) return null;

    const metricData = metrics.metrics[selectedMetric];
    const data = {
      labels: ['P50', 'P75', 'P90', 'P95', 'P99'],
      datasets: [
        {
          label: `${selectedMetric} Percentiles`,
          data: metricData.percentiles ? [
            metricData.percentiles.p50,
            metricData.percentiles.p75,
            metricData.percentiles.p90,
            metricData.percentiles.p95,
            metricData.percentiles.p99
          ] : [],
          borderColor: getScoreColor(
            metricData.ratings.good,
            metricData.ratings['needs-improvement'],
            metricData.ratings.poor
          ),
          backgroundColor: getScoreColor(
            metricData.ratings.good,
            metricData.ratings['needs-improvement'],
            metricData.ratings.poor
          ) + '20',
          tension: 0.4
        }
      ]
    };

    return (
      <Line 
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: `${selectedMetric} Performance Distribution`
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Time (ms)'
              }
            }
          }
        }}
      />
    );
  };

  const generateRatingChart = () => {
    if (!metrics) return null;

    const coreMetrics = ['LCP', 'FCP', 'CLS', 'TTFB', 'INP'];
    const goodData = coreMetrics.map(metric => 
      metrics.metrics[metric]?.ratings.good || 0
    );
    const needsWorkData = coreMetrics.map(metric => 
      metrics.metrics[metric]?.ratings['needs-improvement'] || 0
    );
    const poorData = coreMetrics.map(metric => 
      metrics.metrics[metric]?.ratings.poor || 0
    );

    const data = {
      labels: coreMetrics,
      datasets: [
        {
          label: 'Good',
          data: goodData,
          backgroundColor: '#52c41a',
        },
        {
          label: 'Needs Improvement',
          data: needsWorkData,
          backgroundColor: '#faad14',
        },
        {
          label: 'Poor',
          data: poorData,
          backgroundColor: '#f5222d',
        }
      ]
    };

    return (
      <Bar 
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Core Web Vitals Score Distribution'
            }
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
              title: {
                display: true,
                text: 'Number of Measurements'
              }
            }
          }
        }}
      />
    );
  };

  const exportData = () => {
    if (!metrics) return;

    const dataStr = JSON.stringify(metrics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
            <Button 
              onClick={fetchMetrics}
              type="primary"
              icon={<ReloadOutlined />}
            >
              Retry
            </Button>
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <DashboardOutlined />
                Performance Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitoring {metrics.totalEntries} metrics from{' '}
                {new Date(metrics.timeRange.from).toLocaleString()} to{' '}
                {new Date(metrics.timeRange.to).toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={exportData}
                icon={<DownloadOutlined />}
              >
                Export Data
              </Button>
              <Button
                onClick={fetchMetrics}
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading}
              >
                Refresh
              </Button>
            </div>
          </div>
          
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
              {autoRefresh && ' (Auto-refresh enabled)'}
            </p>
          )}
        </div>

        {/* Overview Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Metrics"
                value={metrics.totalEntries}
                prefix={<DashboardOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
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
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Slow Resources"
                value={metrics.metrics.SLOW_RESOURCE?.count || 0}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Long Tasks"
                value={metrics.metrics.LONG_TASK?.count || 0}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} lg={12}>
            <Card 
              title="Core Web Vitals Distribution"
              extra={<LineChartOutlined />}
            >
              {generateRatingChart()}
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title="Performance Percentiles"
              extra={
                <Select
                  value={selectedMetric}
                  onChange={setSelectedMetric}
                  style={{ width: 100 }}
                >
                  {Object.keys(metrics.metrics).map(metric => (
                    <Select.Option key={metric} value={metric}>
                      {metric}
                    </Select.Option>
                  ))}
                </Select>
              }
            >
              {generateTrendChart()}
            </Card>
          </Col>
        </Row>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(metrics.metrics).map(([metricName, metricData]) => {
            const avgValue = metricData.percentiles?.p50 || 0;
            const status = getMetricStatus(metricName, avgValue);
            
            return (
              <Card
                key={metricName}
                className={`border-l-4 ${
                  status === 'good' ? 'border-l-green-500' :
                  status === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{metricName}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      status === 'good' ? 'bg-green-100 text-green-800' :
                      status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">P50:</span> {metricData.percentiles?.p50?.toFixed(1) || 'N/A'}ms
                    </div>
                    <div>
                      <span className="text-gray-500">P95:</span> {metricData.percentiles?.p95?.toFixed(1) || 'N/A'}ms
                    </div>
                    <div>
                      <span className="text-gray-500">Count:</span> {metricData.count}
                    </div>
                    <div>
                      <span className="text-gray-500">Good:</span> {metricData.ratings.good}
                    </div>
                  </div>
                  
                  <Progress
                    percent={Math.round((metricData.ratings.good / metricData.count) * 100)}
                    strokeColor={getScoreColor(
                      metricData.ratings.good,
                      metricData.ratings['needs-improvement'],
                      metricData.ratings.poor
                    )}
                    size="small"
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
} 