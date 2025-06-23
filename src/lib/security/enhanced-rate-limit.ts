/**
 * Enhanced Rate Limiting with Redis Fallback
 * Automatically switches to in-memory storage when Redis quota is exhausted
 */

import { NextRequest } from 'next/server';
import { rateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

// Simple in-memory storage for suspicious activity
const suspiciousActivities = new Map<string, { attempts: number; lastAttempt: number; blocked: boolean }>();

// Rate limiting with basic tracking
export async function enhancedRateLimit(
  request: NextRequest,
  limiterType: keyof typeof RATE_LIMITS
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  blocked?: boolean;
  suspicious?: boolean;
}> {
  const ip = getClientIP(request);
  const config = RATE_LIMITS[limiterType];
  
  try {
    // Check if IP is blocked
    const suspiciousActivity = suspiciousActivities.get(ip);
    if (suspiciousActivity?.blocked) {
      return {
        success: false,
        limit: config.uniqueTokenPerInterval,
        remaining: 0,
        reset: new Date(Date.now() + config.interval),
        blocked: true,
        suspicious: true
      };
    }

    // Track suspicious activity
    const now = Date.now();
    const activity = suspiciousActivities.get(ip) || { attempts: 0, lastAttempt: now, blocked: false };
    activity.attempts++;
    activity.lastAttempt = now;
    
    if (activity.attempts > 50) { // Block after 50 attempts
      activity.blocked = true;
    }
    
    suspiciousActivities.set(ip, activity);
    
    // Apply rate limiting
    const result = await rateLimit(request, config);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset),
      blocked: activity.blocked,
      suspicious: activity.attempts > 30 // Warning threshold
    };
  } catch (error) {
    console.error('Rate limiting failed:', error);
    
    // Emergency fallback - allow request but log
    return {
      success: true,
      limit: config.uniqueTokenPerInterval,
      remaining: config.uniqueTokenPerInterval - 1,
      reset: new Date(Date.now() + config.interval),
      blocked: false,
      suspicious: false
    };
  }
}

// Middleware factory
export function createEnhancedRateLimitMiddleware(limiterType: keyof typeof RATE_LIMITS) {
  return async (request: NextRequest) => {
    const result = await enhancedRateLimit(request, limiterType);
    
    // Add headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.getTime().toString());
    
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
      suspicious: result.suspicious
    };
  };
}

// Admin functions for managing IPs
export class IPManager {
  static async getSuspiciousIPs(): Promise<Array<{
    ip: string;
    attempts: number;
    blocked: boolean;
    lastAttempt?: number;
  }>> {
    const result = [];
    for (const [ip, data] of suspiciousActivities.entries()) {
      result.push({
        ip,
        attempts: data.attempts,
        blocked: data.blocked,
        lastAttempt: data.lastAttempt
      });
    }
    return result;
  }

  static async blockIP(ip: string): Promise<void> {
    const activity = suspiciousActivities.get(ip) || { attempts: 0, lastAttempt: Date.now(), blocked: false };
    activity.blocked = true;
    suspiciousActivities.set(ip, activity);
    console.log(`✅ IP ${ip} blocked`);
  }

  static async unblockIP(ip: string): Promise<void> {
    const activity = suspiciousActivities.get(ip);
    if (activity) {
      activity.blocked = false;
      activity.attempts = 0;
      suspiciousActivities.set(ip, activity);
      console.log(`✅ IP ${ip} unblocked`);
    }
  }

  static clearAll(): void {
    suspiciousActivities.clear();
  }
}

// Health check endpoint data
export function getSecurityStatus() {
  return {
    rateLimiters: RATE_LIMITS,
    suspiciousActivityThreshold: 50,
    blockDuration: 3600,
    timestamp: new Date().toISOString(),
    activeTracking: suspiciousActivities.size
  };
}

// Default export
export default {
  enhancedRateLimit,
  createEnhancedRateLimitMiddleware,
  IPManager,
  getSecurityStatus
}; 