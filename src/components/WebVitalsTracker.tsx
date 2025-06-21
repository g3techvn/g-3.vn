'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  entries?: PerformanceEntry[];
}

function sendToAnalytics(metric: WebVitalMetric) {
  try {
    // Validate metric data before sending
    if (!metric || !metric.name || typeof metric.value !== 'number') {
      console.warn('Invalid metric data:', metric);
      return;
    }

    const payload = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      metric: {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
        delta: metric.delta,
        navigationType: metric.navigationType
      }
    };

    const payloadString = JSON.stringify(payload);

    // Use sendBeacon for reliability when page is unloading, otherwise use fetch
    if (document.visibilityState === 'hidden' && 'sendBeacon' in navigator) {
      // sendBeacon is more reliable for data sent during page unload
      navigator.sendBeacon('/api/web-vitals', new Blob([payloadString], {
        type: 'application/json'
      }));
    } else {
      // Use fetch for normal cases
      fetch('/api/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payloadString,
        keepalive: true // Keep connection alive even if page unloads
      }).catch(error => {
        // Fail silently for analytics - only log if it's not an abort error
        if (error.name !== 'AbortError') {
          console.warn('Failed to send web vital metric:', error);
        }
      });
    }

    // Also send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        custom_parameter_1: metric.value,
        custom_parameter_2: metric.id,
        custom_parameter_3: metric.rating,
      });
    }
  } catch (error) {
    // Fail silently for analytics
    console.warn('Error processing web vital metric:', error);
  }
}

export default function WebVitalsTracker() {
  useEffect(() => {
    // Track all Core Web Vitals
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    
    // Track INP (Interaction to Next Paint) - newer metric
    onINP(sendToAnalytics);

    // ✅ Throttling để giảm CPU usage
    let resourceTrackingCount = 0;
    let longTaskTrackingCount = 0;
    const MAX_TRACKING_PER_SESSION = 20; // Giới hạn tracking

    // Custom performance observer for additional metrics
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Track resource loading times - ✅ với throttling
        const resourceObserver = new PerformanceObserver((list) => {
          if (resourceTrackingCount >= MAX_TRACKING_PER_SESSION) return;
          
          list.getEntries().forEach((entry) => {
            // ✅ Tăng threshold để giảm tracking
            if (entry.duration > 1000 && resourceTrackingCount < MAX_TRACKING_PER_SESSION) { // Tăng từ 500ms lên 1000ms
              resourceTrackingCount++;
              sendToAnalytics({
                name: 'SLOW_RESOURCE',
                value: entry.duration,
                id: `${entry.name}-${Date.now()}`,
                rating: entry.duration > 2000 ? 'poor' : 'needs-improvement', // Tăng threshold
                delta: entry.duration,
                navigationType: 'resource'
              });
            }
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Track long tasks - ✅ với throttling
        const longTaskObserver = new PerformanceObserver((list) => {
          if (longTaskTrackingCount >= MAX_TRACKING_PER_SESSION) return;
          
          list.getEntries().forEach((entry) => {
            // ✅ Tăng threshold và thêm throttling
            if (entry.duration > 200 && longTaskTrackingCount < MAX_TRACKING_PER_SESSION) { // Tăng từ 100ms lên 200ms
              longTaskTrackingCount++;
              sendToAnalytics({
                name: 'LONG_TASK',
                value: entry.duration,
                id: `longtask-${Date.now()}`,
                rating: entry.duration > 300 ? 'poor' : 'needs-improvement', // Tăng threshold
                delta: entry.duration,
                navigationType: 'longtask'
              });
            }
          });
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });

      } catch (error) {
        // Some browsers might not support all observer types
        console.warn('Performance observer setup failed:', error);
      }
    }

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Send any pending metrics when page becomes hidden
        sendToAnalytics({
          name: 'PAGE_HIDDEN',
          value: performance.now(),
          id: `hidden-${Date.now()}`,
          rating: 'good',
          delta: 0,
          navigationType: 'visibility'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

// gtag types already declared in existing files 