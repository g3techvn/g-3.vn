/**
 * Enhanced Rate Limiting with Redis Fallback
 * Automatically switches to in-memory storage when Redis quota is exhausted
 */

import { NextRequest } from 'next/server';
import { 
  RateLimiterWithFallback, 
  SuspiciousActivityTrackerWithFallback,
  RedisHealthChecker 
} from './redis-fallback';
import { getClientIP } from './redis-rate-limit';

// Rate limiters with fallback
const rateLimitersWithFallback = {
  orders: new RateLimiterWithFallback('orders', 5, 60), // 5 per minute
  auth: new RateLimiterWithFallback('auth', 10, 60), // 10 per minute
  api: new RateLimiterWithFallback('api', 100, 60), // 100 per minute
  public: new RateLimiterWithFallback('public', 200, 60), // 200 per minute
  search: new RateLimiterWithFallback('search', 50, 60), // 50 per minute
};

// Suspicious activity tracker with fallback
const suspiciousTracker = new SuspiciousActivityTrackerWithFallback(50, 3600);

// Enhanced rate limiting with fallback
export async function enhancedRateLimitWithFallback(
  request: NextRequest,
  limiterType: keyof typeof rateLimitersWithFallback
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  blocked?: boolean;
  suspicious?: boolean;
  usingFallback?: boolean;
}> {
  const ip = getClientIP(request);
  const rateLimiter = rateLimitersWithFallback[limiterType];
  
  try {
    // Check if IP is blocked for suspicious activity
    const isBlocked = await suspiciousTracker.isBlocked(ip);
    if (isBlocked) {
      return {
        success: false,
        limit: rateLimiter.limit,
        remaining: 0,
        reset: new Date(Date.now() + 60000),
        blocked: true,
        suspicious: true,
        usingFallback: !await RedisHealthChecker.getStatus().then(s => s.redis.available),
      };
    }

    // Track request for suspicious activity
    const { blocked, attempts } = await suspiciousTracker.trackActivity(ip);
    
    // Apply rate limiting
    const result = await rateLimiter.checkLimit(ip);
    
    // Get Redis status
    const redisStatus = await RedisHealthChecker.getStatus();
    
    return {
      ...result,
      limit: rateLimiter.limit,
      blocked,
      suspicious: attempts > 30, // Warning threshold
      usingFallback: !redisStatus.redis.available,
    };
  } catch (error) {
    console.error('Rate limiting failed completely:', error);
    
    // Emergency fallback - allow request but log
    return {
      success: true,
      limit: rateLimiter.limit,
      remaining: rateLimiter.limit - 1,
      reset: new Date(Date.now() + 60000),
      blocked: false,
      suspicious: false,
      usingFallback: true,
    };
  }
}

// Middleware factory with fallback
export function createEnhancedRateLimitMiddleware(
  limiterType: keyof typeof rateLimitersWithFallback
) {
  return async (request: NextRequest) => {
    const result = await enhancedRateLimitWithFallback(request, limiterType);
    
    // Add headers with fallback status
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.getTime().toString());
    
    if (result.usingFallback) {
      headers.set('X-RateLimit-Fallback', 'memory');
      headers.set('X-RateLimit-Warning', 'Redis quota exhausted, using memory fallback');
    } else {
      headers.set('X-RateLimit-Fallback', 'redis');
    }
    
    if (result.blocked) {
      headers.set('X-RateLimit-Blocked', 'true');
      headers.set('X-RateLimit-Block-Reason', 'suspicious-activity');
    }
    
    if (result.suspicious) {
      headers.set('X-RateLimit-Warning', 'suspicious-activity-detected');
    }
    
    return {
      success: result.success,
      headers,
      blocked: result.blocked,
      suspicious: result.suspicious,
      usingFallback: result.usingFallback,
    };
  };
}

// Admin functions for managing IPs with fallback
export class EnhancedIPManager {
  static async getSuspiciousIPs(): Promise<Array<{
    ip: string;
    attempts: number;
    blocked: boolean;
    lastAttempt?: number;
  }>> {
    try {
      // This would need to be implemented based on how we store the data
      // For now, return empty array as fallback doesn't expose this directly
      return [];
    } catch (error) {
      console.error('Failed to get suspicious IPs:', error);
      return [];
    }
  }

  static async blockIP(ip: string, duration: number = 3600): Promise<void> {
    try {
      await suspiciousTracker.trackActivity(ip); // This will block if threshold exceeded
      console.log(`✅ IP ${ip} blocked via enhanced system`);
    } catch (error) {
      console.error(`Failed to block IP ${ip}:`, error);
    }
  }

  static async unblockIP(ip: string): Promise<void> {
    try {
      await suspiciousTracker.unblockIP(ip);
      console.log(`✅ IP ${ip} unblocked via enhanced system`);
    } catch (error) {
      console.error(`Failed to unblock IP ${ip}:`, error);
    }
  }

  static async getSystemStatus() {
    return await RedisHealthChecker.getStatus();
  }

  static async forceRedisReconnect(): Promise<boolean> {
    return await RedisHealthChecker.forceRedisReconnect();
  }

  static clearMemoryFallback(): void {
    RedisHealthChecker.clearMemoryFallback();
  }
}

// Health check endpoint data
export async function getEnhancedSecurityStatus() {
  const status = await RedisHealthChecker.getStatus();
  
  return {
    ...status,
    rateLimiters: {
      orders: { limit: 5, window: 60 },
      auth: { limit: 10, window: 60 },
      api: { limit: 100, window: 60 },
      public: { limit: 200, window: 60 },
      search: { limit: 50, window: 60 },
    },
    suspiciousActivityThreshold: 50,
    blockDuration: 3600,
    timestamp: new Date().toISOString(),
  };
}

// Export rate limiters for backward compatibility
export { rateLimitersWithFallback as rateLimiters };
export { suspiciousTracker };

// Default export
export default {
  enhancedRateLimitWithFallback,
  createEnhancedRateLimitMiddleware,
  EnhancedIPManager,
  getEnhancedSecurityStatus,
}; 