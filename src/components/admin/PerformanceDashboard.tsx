'use client';

import React, { useState, useEffect } from 'react';
// ✅ Optimized Antd imports for tree-shaking
import Card from 'antd/es/card';
import Statistic from 'antd/es/statistic';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Select from 'antd/es/select';
import Table from 'antd/es/table';
import Alert from 'antd/es/alert';
import Spin from 'antd/es/spin';
import Progress from 'antd/es/progress';
import Tag from 'antd/es/tag';
import List from 'antd/es/list';
import Typography from 'antd/es/typography';
import { CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined, DashboardOutlined, MobileOutlined, DesktopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Title, Text } = Typography;

interface AggregatedMetric {
  count: number;
  values: number[];
  ratings: {
    good: number;
    'needs-improvement': number;
    poor: number;
  };
  percentiles: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

interface DashboardData {
  success: boolean;
  source: string;
  totalEntries: number;
  timeRange: {
    from: string;
    to: string;
    days: number;
  };
  metrics: Record<string, AggregatedMetric>;
  insights: {
    topPages: Array<{ pathname: string; count: number; avgValue: number }>;
    deviceBreakdown: Array<{ device: string; count: number }>;
    browserBreakdown: Array<{ browser: string; count: number }>;
  };
}

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'good': return '#52c41a';
    case 'needs-improvement': return '#faad14';
    case 'poor': return '#ff4d4f';
    default: return '#d9d9d9';
  }
};

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case 'good': return <CheckCircleOutlined style={{ color: getRatingColor(rating) }} />;
    case 'needs-improvement': return <ExclamationCircleOutlined style={{ color: getRatingColor(rating) }} />;
    case 'poor': return <CloseCircleOutlined style={{ color: getRatingColor(rating) }} />;
    default: return null;
  }
};

const getMetricThreshold = (metricName: string) => {
  switch (metricName) {
    case 'LCP': return { good: 2500, poor: 4000 };
    case 'FCP': return { good: 1800, poor: 3000 };
    case 'CLS': return { good: 0.1, poor: 0.25 };
    case 'TTFB': return { good: 800, poor: 1800 };
    case 'INP': return { good: 200, poor: 500 };
    default: return { good: 100, poor: 1000 };
  }
};

const formatMetricValue = (value: number, metricName: string) => {
  if (metricName === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
};

export default function PerformanceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [dateRange, setDateRange] = useState<number>(7);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        days: dateRange.toString(),
      });
      
      if (selectedMetric) params.append('metric', selectedMetric);
      if (selectedPath) params.append('pathname', selectedPath);
      
      const response = await fetch(`/api/web-vitals?${params}`, {
        headers: {
          'Authorization': 'Bearer admin-key'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMetric, selectedPath, dateRange]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Data"
        description={error}
        type="error"
        showIcon
        action={
          <button onClick={fetchData} style={{ border: 'none', background: 'transparent', color: '#1890ff', cursor: 'pointer' }}>
            Retry
          </button>
        }
      />
    );
  }

  if (!data) {
    return <Alert message="No data available" type="info" showIcon />;
  }

  const metricNames = Object.keys(data.metrics);

  const pageColumns: ColumnsType<any> = [
    {
      title: 'Page',
      dataIndex: 'pathname',
      key: 'pathname',
      ellipsis: true,
    },
    {
      title: 'Measurements',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Avg Value',
      dataIndex: 'avgValue',
      key: 'avgValue',
      render: (value: number) => formatMetricValue(value, selectedMetric || 'LCP'),
      sorter: (a, b) => a.avgValue - b.avgValue,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Performance Dashboard</Title>
      
      {/* Controls */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Select
                  placeholder="Select Metric"
                  value={selectedMetric}
                  onChange={setSelectedMetric}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {metricNames.map(name => (
                    <Option key={name} value={name}>{name}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Select Page"
                  value={selectedPath}
                  onChange={setSelectedPath}
                  style={{ width: '100%' }}
                  allowClear
                >
                  {data?.insights?.topPages?.map(page => (
                    <Option key={page.pathname} value={page.pathname}>
                      {page.pathname}
                    </Option>
                  )) || []}
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  value={dateRange}
                  onChange={setDateRange}
                  style={{ width: '100%' }}
                >
                  <Option value={1}>Last 24 hours</Option>
                  <Option value={7}>Last 7 days</Option>
                  <Option value={30}>Last 30 days</Option>
                  <Option value={90}>Last 90 days</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Measurements"
                  value={data?.totalEntries || 0}
                  prefix={<DashboardOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Core Web Vitals Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {metricNames.map(metricName => {
          const metric = data?.metrics?.[metricName];
          if (!metric) return null;
          const threshold = getMetricThreshold(metricName);
          const p75 = metric.percentiles?.p75 || 0;
          const rating = p75 <= threshold.good ? 'good' : p75 <= threshold.poor ? 'needs-improvement' : 'poor';
          const goodPercentage = (metric.ratings.good / metric.count) * 100;

          return (
            <Col span={6} key={metricName}>
              <Card>
                <Statistic
                  title={metricName}
                  value={formatMetricValue(p75, metricName)}
                  valueStyle={{ color: getRatingColor(rating) }}
                  prefix={getRatingIcon(rating)}
                />
                <Progress
                  percent={goodPercentage}
                  strokeColor={getRatingColor('good')}
                  trailColor={getRatingColor('poor')}
                  size="small"
                />
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  <Tag color={getRatingColor('good')}>{metric.ratings.good} Good</Tag>
                  <Tag color={getRatingColor('needs-improvement')}>{metric.ratings['needs-improvement']} Needs Improvement</Tag>
                  <Tag color={getRatingColor('poor')}>{metric.ratings.poor} Poor</Tag>
                </div>
                <div style={{ marginTop: 8, fontSize: '11px', color: '#999' }}>
                  <Text type="secondary">P50: {formatMetricValue(metric.percentiles?.p50 || 0, metricName)}</Text>
                  <br />
                  <Text type="secondary">P95: {formatMetricValue(metric.percentiles?.p95 || 0, metricName)}</Text>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Detailed Tables */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="Top Pages" size="small">
            <Table
              columns={pageColumns}
              dataSource={data?.insights?.topPages?.slice(0, 10) || []}
              pagination={false}
              size="small"
              rowKey="pathname"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Device Breakdown" size="small">
            <List
              size="small"
              dataSource={data?.insights?.deviceBreakdown || []}
              renderItem={(item: { device: string; count: number }) => (
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>
                      {item.device === 'mobile' ? <MobileOutlined /> : <DesktopOutlined />}
                      {' '}{item.device}
                    </span>
                    <Tag>{item.count}</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Browser Breakdown" size="small">
            <List
              size="small"
              dataSource={data?.insights?.browserBreakdown || []}
              renderItem={(item: { browser: string; count: number }) => (
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{item.browser}</span>
                    <Tag>{item.count}</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Detailed Metrics Table */}
      {selectedMetric && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title={`${selectedMetric} Detailed Statistics`}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="P50 (Median)"
                    value={formatMetricValue(data?.metrics?.[selectedMetric]?.percentiles?.p50 || 0, selectedMetric)}
                    valueStyle={{ color: getRatingColor('good') }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="P75"
                    value={formatMetricValue(data?.metrics?.[selectedMetric]?.percentiles?.p75 || 0, selectedMetric)}
                    valueStyle={{ color: getRatingColor('needs-improvement') }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="P95"
                    value={formatMetricValue(data?.metrics?.[selectedMetric]?.percentiles?.p95 || 0, selectedMetric)}
                    valueStyle={{ color: getRatingColor('poor') }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Performance Metrics Explanation */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="📊 Hướng dẫn đọc hiểu các thông số Performance" size="small">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="🎯 Core Web Vitals" type="inner">
                  <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    <div><strong>LCP (Largest Contentful Paint):</strong></div>
                                         <div>• <span style={{color: '#52c41a'}}>Tốt: ≤ 2.5s</span> | <span style={{color: '#faad14'}}>Cần cải thiện: 2.5-4s</span> | <span style={{color: '#ff4d4f'}}>Kém: &gt; 4s</span></div>
                    <div>• Thời gian hiển thị phần tử lớn nhất trên trang</div>
                    <br/>
                    <div><strong>FCP (First Contentful Paint):</strong></div>
                                         <div>• <span style={{color: '#52c41a'}}>Tốt: ≤ 1.8s</span> | <span style={{color: '#faad14'}}>Cần cải thiện: 1.8-3s</span> | <span style={{color: '#ff4d4f'}}>Kém: &gt; 3s</span></div>
                     <div>• Thời gian hiển thị nội dung đầu tiên</div>
                     <br/>
                     <div><strong>CLS (Cumulative Layout Shift):</strong></div>
                     <div>• <span style={{color: '#52c41a'}}>Tốt: ≤ 0.1</span> | <span style={{color: '#faad14'}}>Cần cải thiện: 0.1-0.25</span> | <span style={{color: '#ff4d4f'}}>Kém: &gt; 0.25</span></div>
                     <div>• Độ dịch chuyển bố cục không mong muốn</div>
                     <br/>
                     <div><strong>INP (Interaction to Next Paint):</strong></div>
                     <div>• <span style={{color: '#52c41a'}}>Tốt: ≤ 200ms</span> | <span style={{color: '#faad14'}}>Cần cải thiện: 200-500ms</span> | <span style={{color: '#ff4d4f'}}>Kém: &gt; 500ms</span></div>
                    <div>• Thời gian phản hồi tương tác người dùng</div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="⚡ Performance Metrics" type="inner">
                  <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    <div><strong>TTFB (Time to First Byte):</strong></div>
                                         <div>• <span style={{color: '#52c41a'}}>Tốt: ≤ 800ms</span> | <span style={{color: '#faad14'}}>Cần cải thiện: 800-1800ms</span> | <span style={{color: '#ff4d4f'}}>Kém: &gt; 1800ms</span></div>
                     <div>• Thời gian server phản hồi byte đầu tiên</div>
                     <br/>
                     <div><strong>SLOW_RESOURCE:</strong></div>
                     <div>• <span style={{color: '#52c41a'}}>Tốt: ≤ 500ms</span> | <span style={{color: '#faad14'}}>Cần cải thiện: 500-1000ms</span> | <span style={{color: '#ff4d4f'}}>Kém: &gt; 1000ms</span></div>
                     <div>• Tài nguyên tải chậm (JS, CSS, hình ảnh)</div>
                     <br/>
                     <div><strong>LONG_TASK:</strong></div>
                     <div>• <span style={{color: '#52c41a'}}>Tốt: ≤ 50ms</span> | <span style={{color: '#faad14'}}>Cần cải thiện: 50-100ms</span> | <span style={{color: '#ff4d4f'}}>Kém: &gt; 100ms</span></div>
                    <div>• Tác vụ JavaScript chạy lâu, chặn UI</div>
                    <br/>
                    <div><strong>PAGE_HIDDEN:</strong></div>
                    <div>• Thời gian người dùng ở lại trang (ms)</div>
                    <div>• Cao = tốt (người dùng tương tác lâu)</div>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
              <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                <strong>📈 Cách đọc Percentiles:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                  <li><strong>P50 (Median):</strong> 50% người dùng có trải nghiệm tốt hơn giá trị này</li>
                  <li><strong>P75:</strong> 75% người dùng có trải nghiệm tốt hơn - chỉ số quan trọng nhất</li>
                  <li><strong>P95:</strong> 95% người dùng có trải nghiệm tốt hơn - phát hiện vấn đề nghiêm trọng</li>
                </ul>
                <strong>🎯 Mục tiêu tối ưu:</strong> P75 của tất cả Core Web Vitals nên đạt mức "Tốt"
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Automated Recommendations Based on Current Data */}
      {data && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="🤖 Đề xuất tự động dựa trên dữ liệu hiện tại" size="small">
                             {(() => {
                 const issues: Array<{
                   metric: string;
                   severity: 'critical' | 'warning';
                   issue: string;
                   percentage: number;
                   count: number;
                 }> = [];
                 const recommendations: Array<{
                   priority: 'high' | 'medium' | 'low';
                   metric: string;
                   title: string;
                   actions: string[];
                 }> = [];
                
                // Analyze current metrics for issues
                Object.entries(data.metrics || {}).forEach(([metricName, metric]) => {
                  if (!metric) return;
                  
                  const threshold = getMetricThreshold(metricName);
                  const p75 = metric.percentiles?.p75 || 0;
                  const p95 = metric.percentiles?.p95 || 0;
                  const poorCount = metric.ratings?.poor || 0;
                  const needsImprovementCount = metric.ratings['needs-improvement'] || 0;
                  const totalCount = metric.count || 1;
                  
                  const poorPercentage = (poorCount / totalCount) * 100;
                  const needsImprovementPercentage = (needsImprovementCount / totalCount) * 100;
                  
                  if (p75 > threshold.poor) {
                    issues.push({
                      metric: metricName,
                      severity: 'critical',
                      issue: `${metricName} P75 (${formatMetricValue(p75, metricName)}) vượt ngưỡng Poor`,
                      percentage: poorPercentage,
                      count: poorCount
                    });
                  } else if (p75 > threshold.good) {
                    issues.push({
                      metric: metricName,
                      severity: 'warning',
                      issue: `${metricName} P75 (${formatMetricValue(p75, metricName)}) cần cải thiện`,
                      percentage: needsImprovementPercentage,
                      count: needsImprovementCount
                    });
                  }
                  
                  // Generate specific recommendations
                  if (metricName === 'SLOW_RESOURCE' && poorPercentage > 20) {
                    recommendations.push({
                      priority: 'high',
                      metric: metricName,
                      title: '🚨 Tài nguyên tải chậm nghiêm trọng',
                      actions: [
                        `${poorCount} requests tải chậm (&gt; 1000ms)`,
                        'Tối ưu bundle size và code splitting',
                        'Sử dụng CDN cho static assets',
                        'Lazy loading cho components không cần thiết',
                        'Preload critical resources'
                      ]
                    });
                  }
                  
                  if (metricName === 'LONG_TASK' && poorPercentage > 15) {
                    recommendations.push({
                      priority: 'high', 
                      metric: metricName,
                      title: '⚠️ JavaScript tasks chặn UI',
                      actions: [
                        `${poorCount} long tasks (&gt; 100ms)`,
                        'Break up long JavaScript tasks',
                        'Use requestIdleCallback for non-critical work',
                        'Implement Web Workers cho heavy computation',
                        'Debounce user input handlers'
                      ]
                    });
                  }
                  
                  if (metricName === 'CLS' && needsImprovementPercentage > 25) {
                    recommendations.push({
                      priority: 'medium',
                      metric: metricName, 
                      title: '📐 Layout shift cần cải thiện',
                      actions: [
                        `${needsImprovementCount} measurements có CLS &gt; 0.1`,
                        'Đặt width/height cho tất cả images',
                        'Reserve space cho dynamic content',
                        'Preload fonts để tránh FOIT',
                        'Sử dụng transform thay vì thay đổi layout properties'
                      ]
                    });
                  }
                  
                  if (metricName === 'LCP' && p75 > 2500) {
                    recommendations.push({
                      priority: 'high',
                      metric: metricName,
                      title: '🖼️ LCP cần tối ưu',
                      actions: [
                        `P75 LCP: ${formatMetricValue(p75, metricName)}`,
                        'Tối ưu hình ảnh hero (WebP, AVIF)',
                        'Preload LCP element',
                        'Giảm server response time',
                        'Inline critical CSS'
                      ]
                    });
                  }
                });
                
                // Sort recommendations by priority
                recommendations.sort((a, b) => {
                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                });
                
                return (
                  <div>
                    {/* Critical Issues */}
                    {issues.filter(i => i.severity === 'critical').length > 0 && (
                      <Alert
                        message="🚨 Vấn đề nghiêm trọng cần xử lý ngay"
                        description={
                          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                            {issues.filter(i => i.severity === 'critical').map((issue, idx) => (
                              <li key={idx} style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
                                {issue.issue} ({issue.count} measurements)
                              </li>
                            ))}
                          </ul>
                        }
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    )}
                    
                    {/* Warning Issues */}
                    {issues.filter(i => i.severity === 'warning').length > 0 && (
                      <Alert
                        message="⚠️ Vấn đề cần cải thiện"
                        description={
                          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                            {issues.filter(i => i.severity === 'warning').map((issue, idx) => (
                              <li key={idx} style={{ color: '#faad14' }}>
                                {issue.issue} ({issue.count} measurements)
                              </li>
                            ))}
                          </ul>
                        }
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                      />
                    )}
                    
                    {/* Recommendations */}
                    <Row gutter={[16, 16]}>
                      {recommendations.slice(0, 3).map((rec, idx) => (
                        <Col span={8} key={idx}>
                          <Card 
                            size="small" 
                            title={rec.title} 
                            type="inner"
                            style={{ 
                              height: 220,
                              border: rec.priority === 'high' ? '2px solid #ff4d4f' : '1px solid #d9d9d9'
                            }}
                          >
                            <div style={{ fontSize: '12px' }}>
                              <div style={{ 
                                marginBottom: 8, 
                                padding: 4, 
                                backgroundColor: rec.priority === 'high' ? '#fff2f0' : '#f6ffed',
                                borderRadius: 4,
                                fontWeight: 'bold',
                                color: rec.priority === 'high' ? '#ff4d4f' : '#52c41a'
                              }}>
                                Ưu tiên: {rec.priority === 'high' ? 'CAO' : 'TRUNG BÌNH'}
                              </div>
                              <ul style={{ margin: 0, paddingLeft: 16, lineHeight: '1.4' }}>
                                {rec.actions.map((action, actionIdx) => (
                                  <li key={actionIdx} style={{ marginBottom: 4 }}>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                    
                    {issues.length === 0 && recommendations.length === 0 && (
                      <Alert
                        message="🎉 Performance tốt!"
                        description="Tất cả metrics đều đạt mức tốt. Tiếp tục monitor để duy trì performance."
                        type="success"
                        showIcon
                      />
                    )}
                  </div>
                );
              })()}
            </Card>
          </Col>
        </Row>
      )}

      {/* Performance Recommendations */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="💡 Hướng dẫn tối ưu Performance tổng quát" size="small">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" title="🚀 LCP Optimization" type="inner" style={{ height: 200 }}>
                  <div style={{ fontSize: '12px' }}>
                    <strong>Cải thiện LCP:</strong>
                    <ul style={{ margin: '8px 0', paddingLeft: 16 }}>
                      <li>Tối ưu hình ảnh (WebP, lazy loading)</li>
                      <li>Preload font và tài nguyên quan trọng</li>
                      <li>Giảm kích thước CSS/JS</li>
                      <li>Sử dụng CDN</li>
                      <li>Tối ưu server response time</li>
                    </ul>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="⚡ CLS Optimization" type="inner" style={{ height: 200 }}>
                  <div style={{ fontSize: '12px' }}>
                    <strong>Giảm CLS:</strong>
                    <ul style={{ margin: '8px 0', paddingLeft: 16 }}>
                      <li>Đặt width/height cho images</li>
                      <li>Reserve space cho ads/embeds</li>
                      <li>Tránh inject content phía trên</li>
                      <li>Sử dụng transform thay vì thay đổi layout</li>
                      <li>Preload font để tránh FOIT</li>
                    </ul>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="🎯 INP Optimization" type="inner" style={{ height: 200 }}>
                  <div style={{ fontSize: '12px' }}>
                    <strong>Cải thiện INP:</strong>
                    <ul style={{ margin: '8px 0', paddingLeft: 16 }}>
                      <li>Tối ưu JavaScript execution</li>
                      <li>Debounce input handlers</li>
                      <li>Code splitting và lazy loading</li>
                      <li>Sử dụng Web Workers</li>
                      <li>Giảm main thread blocking</li>
                    </ul>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Data Source Info */}
      <Row>
        <Col span={24}>
          <Alert
            message={`Data Source: ${data?.source || 'Unknown'} | Time Range: ${data?.timeRange?.days || 0} days | Last Updated: ${new Date().toLocaleString()}`}
            type="info"
            showIcon
          />
        </Col>
      </Row>
    </div>
  );
} 