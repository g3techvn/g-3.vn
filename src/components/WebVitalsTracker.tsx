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
    // Send to our custom API
    fetch('/api/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
      }),
    }).catch(error => {
      // Fail silently for analytics
      console.warn('Failed to send web vital metric:', error);
    });

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

    // Custom performance observer for additional metrics
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Track resource loading times
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // Track slow resources (>500ms)
            if (entry.duration > 500) {
              sendToAnalytics({
                name: 'SLOW_RESOURCE',
                value: entry.duration,
                id: `${entry.name}-${Date.now()}`,
                rating: entry.duration > 1000 ? 'poor' : 'needs-improvement',
                delta: entry.duration,
                navigationType: 'resource'
              });
            }
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });

        // Track long tasks (blocking main thread)
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            sendToAnalytics({
              name: 'LONG_TASK',
              value: entry.duration,
              id: `longtask-${Date.now()}`,
              rating: entry.duration > 100 ? 'poor' : 'needs-improvement',
              delta: entry.duration,
              navigationType: 'longtask'
            });
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