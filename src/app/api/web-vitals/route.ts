import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/rate-limit';
import { securityLogger } from '@/lib/logger';

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  entries?: PerformanceEntry[];
}

interface WebVitalRequest {
  url: string;
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
  metric: WebVitalMetric;
}

interface WebVitalLog {
  timestamp: string;
  ip: string;
  url: string;
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
  metric: {
    name: string;
    value: number;
    id: string;
    rating: string;
    delta: number;
    navigationType: string;
  };
}

// Extend global to include webVitalsData
declare global {
  var webVitalsData: WebVitalLog[] | undefined;
}

// Helper function to extract device and browser info from user agent
function extractDeviceInfo(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Device type detection
  let deviceType = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
  }
  
  // Browser detection
  let browserName = 'unknown';
  let browserVersion = '';
  
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browserName = 'chrome';
    const match = ua.match(/chrome\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('firefox')) {
    browserName = 'firefox';
    const match = ua.match(/firefox\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browserName = 'safari';
    const match = ua.match(/version\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('edg')) {
    browserName = 'edge';
    const match = ua.match(/edg\/(\d+)/);
    browserVersion = match ? match[1] : '';
  }
  
  // Screen resolution (if available in user agent)
  let screenResolution = '';
  if (typeof window !== 'undefined' && window.screen) {
    screenResolution = `${window.screen.width}x${window.screen.height}`;
  }
  
  return {
    deviceType,
    browserName,
    browserVersion,
    screenResolution
  };
}

// Create server client with service role key for admin operations
function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(supabaseUrl, supabaseKey);
}

// Create admin client with service role key (bypasses RLS)
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Check if request has body
    const contentLength = request.headers.get('content-length');
    if (!contentLength || contentLength === '0') {
      return NextResponse.json(
        { error: 'No request body provided' },
        { status: 400 }
      );
    }

    // Try to read the request body with additional error handling
    let data: WebVitalRequest;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        );
      }
      data = JSON.parse(text);
    } catch (parseError) {
      securityLogger.logError('JSON parse error in web-vitals', parseError as Error, {
        ip,
        endpoint: '/api/web-vitals',
        contentLength
      });
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    const { url, userAgent, connectionType, deviceMemory, metric } = data;

    // Validate metric data
    if (!metric || !metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Additional validation for metric names
    const validMetricNames = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP', 'SLOW_RESOURCE', 'LONG_TASK', 'PAGE_HIDDEN'];
    if (!validMetricNames.includes(metric.name)) {
      return NextResponse.json(
        { error: `Invalid metric name: ${metric.name}` },
        { status: 400 }
      );
    }

    // Extract additional device/browser info
    const userAgentString = userAgent || '';
    const deviceInfo = extractDeviceInfo(userAgentString);
    const urlObj = new URL(url);
    
    // Prepare data for database storage
    const webVitalData = {
      metric_name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: url,
      pathname: urlObj.pathname,
      user_agent: userAgentString,
      ip_address: ip,
      device_type: deviceInfo.deviceType,
      browser_name: deviceInfo.browserName,
      browser_version: deviceInfo.browserVersion,
      screen_resolution: deviceInfo.screenResolution,
      connection_type: connectionType,
      device_memory: deviceMemory,
      navigation_type: metric.navigationType,
      delta: metric.delta,
      entries: metric.entries ? JSON.stringify(metric.entries) : null,
      session_id: request.headers.get('x-session-id') || null,
    };

    // Save to database
    const supabase = createServerClient();
    const { error: dbError } = await supabase
      .from('web_vitals_metrics')
      .insert(webVitalData);

    if (dbError) {
      securityLogger.logError('Failed to save web vital to database', dbError, {
        ip,
        metric: metric.name,
        value: metric.value
      });
      
      // Fallback to in-memory storage if database fails
      const webVitalLog = {
        timestamp: new Date().toISOString(),
        ip,
        url,
        userAgent,
        connectionType,
        deviceMemory,
        metric: {
          name: metric.name,
          value: metric.value,
          id: metric.id,
          rating: metric.rating,
          delta: metric.delta,
          navigationType: metric.navigationType
        }
      };
      
      if (typeof global !== 'undefined') {
        if (!global.webVitalsData) {
          global.webVitalsData = [];
        }
        global.webVitalsData.push(webVitalLog);
        
        // Keep only last 1000 entries to prevent memory issues
        if (global.webVitalsData.length > 1000) {
          global.webVitalsData = global.webVitalsData.slice(-1000);
        }
      }
    } else {
      securityLogger.logInfo('Web Vital Metric saved to database', {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: urlObj.pathname
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Web vital metric recorded' 
    });

  } catch (error) {
    securityLogger.logError('Error processing web vital metric', error as Error, {
      ip,
      endpoint: '/api/web-vitals'
    });

    return NextResponse.json(
      { error: 'Failed to process metric' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve aggregated metrics (for admin/monitoring)
export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Simple auth check - skip in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || authHeader !== 'Bearer admin-key') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    const metricName = searchParams.get('metric');
    const pathname = searchParams.get('pathname');
    
    // Get metrics from database using admin client to bypass RLS
    const supabase = createAdminClient();
    
    let query = supabase
      .from('web_vitals_metrics')
      .select('*')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
    
    if (metricName) {
      query = query.eq('metric_name', metricName);
    }
    
    if (pathname) {
      query = query.eq('pathname', pathname);
    }
    
    const { data: metrics, error: dbError } = await query.order('created_at', { ascending: false });
    
    if (dbError) {
      securityLogger.logError('Failed to fetch web vitals from database', dbError, { ip });
      
      // Fallback to memory storage
      const memoryMetrics = global.webVitalsData || [];
      return NextResponse.json({
        source: 'memory',
        total: memoryMetrics.length,
        metrics: memoryMetrics.slice(0, 100)
      });
    }
    
    // Calculate basic aggregations from database data
    const aggregated = (metrics || []).reduce((acc: Record<string, {
      count: number;
      values: number[];
      ratings: { good: number; 'needs-improvement': number; poor: number };
      percentiles?: {
        p50: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
      };
    }>, entry: any) => {
      const metricName = entry.metric_name;
      if (!acc[metricName]) {
        acc[metricName] = {
          count: 0,
          values: [],
          ratings: { good: 0, 'needs-improvement': 0, poor: 0 }
        };
      }
      
      acc[metricName].count++;
      acc[metricName].values.push(entry.value);
      const rating = entry.rating as 'good' | 'needs-improvement' | 'poor';
      if (rating in acc[metricName].ratings) {
        acc[metricName].ratings[rating]++;
      }
      
      return acc;
    }, {});

    // Calculate percentiles for each metric
    Object.keys(aggregated).forEach(metricName => {
      const values = aggregated[metricName].values.sort((a: number, b: number) => a - b);
      const count = values.length;
      
      if (count > 0) {
        aggregated[metricName].percentiles = {
          p50: values[Math.floor(count * 0.5)],
          p75: values[Math.floor(count * 0.75)],
          p90: values[Math.floor(count * 0.9)],
          p95: values[Math.floor(count * 0.95)],
          p99: values[Math.floor(count * 0.99)]
        };
      }
    });

    securityLogger.logApiAccess(ip, '/api/web-vitals', 'GET');

    return NextResponse.json({
      success: true,
      source: 'database',
      totalEntries: metrics?.length || 0,
      timeRange: {
        from: metrics && metrics.length > 0 ? metrics[metrics.length - 1].created_at : null,
        to: metrics && metrics.length > 0 ? metrics[0].created_at : null,
        days: days
      },
      filters: {
        metric: metricName,
        pathname: pathname
      },
      metrics: aggregated,
      // Additional insights
      insights: {
        topPages: getTopPages(metrics || []),
        deviceBreakdown: getDeviceBreakdown(metrics || []),
        browserBreakdown: getBrowserBreakdown(metrics || [])
      }
    });

  } catch (error) {
    securityLogger.logError('Error retrieving web vitals data', error as Error, {
      ip,
      endpoint: '/api/web-vitals'
    });

    return NextResponse.json(
      { error: 'Failed to retrieve metrics' },
      { status: 500 }
    );
  }
}

// Helper functions for additional insights
function getTopPages(metrics: any[]) {
  const pageStats = metrics.reduce((acc: Record<string, { count: number; avgValue: number; totalValue: number }>, entry) => {
    const pathname = entry.pathname || entry.url;
    if (!acc[pathname]) {
      acc[pathname] = { count: 0, avgValue: 0, totalValue: 0 };
    }
    acc[pathname].count++;
    acc[pathname].totalValue += entry.value;
    acc[pathname].avgValue = acc[pathname].totalValue / acc[pathname].count;
    return acc;
  }, {});
  
  return Object.entries(pageStats)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 10)
    .map(([pathname, stats]) => ({ pathname, ...stats }));
}

function getDeviceBreakdown(metrics: any[]) {
  const deviceStats = metrics.reduce((acc: Record<string, number>, entry) => {
    const deviceType = entry.device_type || 'unknown';
    acc[deviceType] = (acc[deviceType] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(deviceStats).map(([device, count]) => ({ device, count }));
}

function getBrowserBreakdown(metrics: any[]) {
  const browserStats = metrics.reduce((acc: Record<string, number>, entry) => {
    const browser = entry.browser_name || 'unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(browserStats).map(([browser, count]) => ({ browser, count }));
} 