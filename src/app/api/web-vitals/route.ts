import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/rate-limit';
import { securityLogger } from '@/lib/logger';

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

    const data: WebVitalRequest = await request.json();
    const { url, userAgent, connectionType, deviceMemory, metric } = data;

    // Validate metric data
    if (!metric || !metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Log web vital metric for analysis
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

    // In production, you would save this to a database
    // For now, we'll use the security logger
    securityLogger.logInfo('Web Vital Metric', webVitalLog);

    // Store in memory for basic analytics (replace with database in production)
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
    // Simple auth check - in production use proper authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer admin-key') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get metrics from memory storage
    const metrics = global.webVitalsData || [];
    
    // Calculate basic aggregations
    const aggregated = metrics.reduce((acc: Record<string, {
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
    }>, entry: WebVitalLog) => {
      const metricName = entry.metric.name;
      if (!acc[metricName]) {
        acc[metricName] = {
          count: 0,
          values: [],
          ratings: { good: 0, 'needs-improvement': 0, poor: 0 }
        };
      }
      
      acc[metricName].count++;
      acc[metricName].values.push(entry.metric.value);
      const rating = entry.metric.rating as 'good' | 'needs-improvement' | 'poor';
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
      totalEntries: metrics.length,
      timeRange: {
        from: metrics.length > 0 ? metrics[0].timestamp : null,
        to: metrics.length > 0 ? metrics[metrics.length - 1].timestamp : null
      },
      metrics: aggregated
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