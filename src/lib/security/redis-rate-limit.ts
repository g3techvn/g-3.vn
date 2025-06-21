import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from 'next/server';

// Redis instance for rate limiting
const redis = Redis.fromEnv();

// Suspicious activity tracking
interface SuspiciousActivity {
  ip: string;
  attempts: number;
  lastAttempt: number;
  blocked: boolean;
  blockExpiry?: number;
}

// Rate limiters for different endpoints
export const rateLimiters = {
  // Very strict for critical operations
  orders: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 orders per minute
    analytics: true,
    prefix: "ratelimit:orders",
  }),
  
  // Auth endpoints - strict
  auth: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 auth attempts per minute
    analytics: true,
    prefix: "ratelimit:auth",
  }),
  
  // General API - moderate
  api: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    analytics: true,
    prefix: "ratelimit:api",
  }),
  
  // Public data - lenient
  public: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(200, "1 m"), // 200 requests per minute
    analytics: true,
    prefix: "ratelimit:public",
  }),
  
  // Search endpoints
  search: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(50, "1 m"), // 50 searches per minute
    analytics: true,
    prefix: "ratelimit:search",
  }),
};

// Suspicious activity detector
class SuspiciousActivityDetector {
  private redis: Redis;
  private readonly SUSPICIOUS_THRESHOLD = 50; // requests per minute
  private readonly BLOCK_DURATION = 3600000; // 1 hour in milliseconds
  private readonly SUSPICIOUS_KEY_PREFIX = "suspicious:";
  private readonly BLOCKED_KEY_PREFIX = "blocked:";

  constructor() {
    this.redis = redis;
  }

  async trackRequest(ip: string): Promise<void> {
    const key = `${this.SUSPICIOUS_KEY_PREFIX}${ip}`;
    const now = Date.now();
    
    // Get current suspicious activity data
    const data = await this.redis.get(key) as SuspiciousActivity | null;
    
    if (!data) {
      // First request from this IP
      await this.redis.setex(key, 3600, JSON.stringify({
        ip,
        attempts: 1,
        lastAttempt: now,
        blocked: false,
      }));
      return;
    }

    // Update attempts
    const updatedData: SuspiciousActivity = {
      ...data,
      attempts: data.attempts + 1,
      lastAttempt: now,
    };

    // Check if suspicious
    if (updatedData.attempts > this.SUSPICIOUS_THRESHOLD) {
      await this.blockIP(ip);
      updatedData.blocked = true;
      updatedData.blockExpiry = now + this.BLOCK_DURATION;
    }

    await this.redis.setex(key, 3600, JSON.stringify(updatedData));
  }

  async isBlocked(ip: string): Promise<boolean> {
    const blockedKey = `${this.BLOCKED_KEY_PREFIX}${ip}`;
    const blockData = await this.redis.get(blockedKey);
    
    if (!blockData) return false;
    
    const { expiry } = JSON.parse(blockData as string);
    const now = Date.now();
    
    if (now > expiry) {
      // Block expired, remove it
      await this.redis.del(blockedKey);
      return false;
    }
    
    return true;
  }

  async blockIP(ip: string, duration?: number): Promise<void> {
    const blockDuration = duration || this.BLOCK_DURATION;
    const expiry = Date.now() + blockDuration;
    const blockedKey = `${this.BLOCKED_KEY_PREFIX}${ip}`;
    
    await this.redis.setex(
      blockedKey,
      Math.ceil(blockDuration / 1000),
      JSON.stringify({
        ip,
        blockedAt: Date.now(),
        expiry,
        reason: 'Suspicious activity detected',
      })
    );
    
    console.log(`🚫 IP ${ip} blocked for suspicious activity until ${new Date(expiry).toISOString()}`);
  }

  async unblockIP(ip: string): Promise<void> {
    const blockedKey = `${this.BLOCKED_KEY_PREFIX}${ip}`;
    const suspiciousKey = `${this.SUSPICIOUS_KEY_PREFIX}${ip}`;
    
    await Promise.all([
      this.redis.del(blockedKey),
      this.redis.del(suspiciousKey),
    ]);
    
    console.log(`✅ IP ${ip} unblocked`);
  }

  async getSuspiciousIPs(): Promise<SuspiciousActivity[]> {
    const keys = await this.redis.keys(`${this.SUSPICIOUS_KEY_PREFIX}*`);
    const activities: SuspiciousActivity[] = [];
    
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        activities.push(JSON.parse(data as string));
      }
    }
    
    return activities.sort((a, b) => b.attempts - a.attempts);
  }
}

// Enhanced IP extraction with security checks
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  let ip = 'unknown';
  
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIP) {
    ip = realIP;
  } else if (cfConnectingIP) {
    ip = cfConnectingIP;
  }
  
  // Validate IP format
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip) && ip !== 'unknown') {
    console.warn(`⚠️ Invalid IP format detected: ${ip}`);
    return 'unknown';
  }
  
  return ip;
}

// Enhanced rate limiting with suspicious activity detection
export async function enhancedRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  blocked?: boolean;
  suspicious?: boolean;
}> {
  const ip = getClientIP(request);
  const detector = new SuspiciousActivityDetector();
  
  // Check if IP is blocked
  const isBlocked = await detector.isBlocked(ip);
  if (isBlocked) {
    return {
      success: false,
      limit: 0,
      remaining: 0,
      reset: new Date(),
      blocked: true,
    };
  }
  
  // Track request for suspicious activity
  await detector.trackRequest(ip);
  
  // Apply rate limiting
  const limiter = rateLimiters[limiterType];
  const { success, limit, remaining, reset } = await limiter.limit(ip);
  
  return {
    success,
    limit,
    remaining,
    reset: new Date(reset),
    suspicious: false,
  };
}

// Security headers with enhanced protection
export function getEnhancedSecurityHeaders(): Record<string, string> {
  return {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com *.google-analytics.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: *.shopee.vn *.cdninstagram.com",
      "connect-src 'self' *.google-analytics.com *.googletagmanager.com",
      "frame-ancestors 'none'",
    ].join('; '),
    
    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Prevent DNS prefetching
    'X-DNS-Prefetch-Control': 'off',
    
    // Download options for IE
    'X-Download-Options': 'noopen',
    
    // Prevent MIME confusion attacks
    'X-Permitted-Cross-Domain-Policies': 'none',
  };
}

// Rate limit middleware factory
export function createRateLimitMiddleware(limiterType: keyof typeof rateLimiters) {
  return async (request: NextRequest) => {
    const result = await enhancedRateLimit(request, limiterType);
    
    if (!result.success) {
      const headers = new Headers(getEnhancedSecurityHeaders());
      headers.set('X-RateLimit-Limit', result.limit.toString());
      headers.set('X-RateLimit-Remaining', result.remaining.toString());
      headers.set('X-RateLimit-Reset', result.reset.toISOString());
      
      if (result.blocked) {
        headers.set('X-Blocked-Reason', 'Suspicious activity detected');
      }
      
      return new Response(
        JSON.stringify({
          error: result.blocked ? 'IP blocked due to suspicious activity' : 'Rate limit exceeded',
          retryAfter: result.reset,
        }),
        {
          status: result.blocked ? 403 : 429,
          headers,
        }
      );
    }
    
    return null; // Continue to next middleware
  };
}

export { SuspiciousActivityDetector }; 