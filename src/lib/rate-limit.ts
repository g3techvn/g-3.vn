import { NextRequest } from 'next/server';

// Simple in-memory rate limiting implementation
const requests = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number; // max requests per interval
}

export function getClientIP(request: NextRequest): string {
  // Get client IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback for unknown IP
  return 'unknown';
}

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = { interval: 60000, uniqueTokenPerInterval: 10 } // 10 requests per minute
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const clientIP = getClientIP(request);
  const key = `ratelimit:${clientIP}`;
  
  // ✅ Optimized cleanup - chỉ cleanup khi cần thiết
  if (requests.size > 1000 || Math.random() < 0.1) { // 10% chance hoặc khi quá nhiều entries
    let cleanupCount = 0;
    for (const [k, v] of requests.entries()) {
      if (v.resetTime <= now) {
        requests.delete(k);
        cleanupCount++;
      }
      
      // ✅ Giới hạn cleanup mỗi lần để tránh CPU spike
      if (cleanupCount > 50) {
        break;
      }
    }
  }
  
  const current = requests.get(key);
  
  if (!current) {
    // First request from this IP
    requests.set(key, {
      count: 1,
      resetTime: now + config.interval
    });
    
    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: now + config.interval
    };
  }
  
  if (current.resetTime <= now) {
    // Reset window
    requests.set(key, {
      count: 1,
      resetTime: now + config.interval
    });
    
    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: now + config.interval
    };
  }
  
  if (current.count >= config.uniqueTokenPerInterval) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: current.resetTime
    };
  }
  
  // Increment count
  current.count++;
  requests.set(key, current);
  
  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - current.count,
    reset: current.resetTime
  };
}

// Specific rate limits for different endpoints
export const RATE_LIMITS = {
  // Very strict for order creation
  ORDERS: { interval: 60000, uniqueTokenPerInterval: 5 }, // 5 orders per minute
  
  // Moderate for general API
  API_GENERAL: { interval: 60000, uniqueTokenPerInterval: 100 }, // 100 requests per minute
  
  // Stricter for auth endpoints
  AUTH: { interval: 60000, uniqueTokenPerInterval: 10 }, // 10 auth requests per minute
  
  // More lenient for public data
  PUBLIC: { interval: 60000, uniqueTokenPerInterval: 200 }, // 200 requests per minute
};

// Security headers helper
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
  };
} 