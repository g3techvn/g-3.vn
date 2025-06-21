/**
 * Redis Fallback System for G3 Security
 * Provides in-memory fallback when Redis quota is exhausted
 */

import { Redis } from '@upstash/redis';

// In-memory fallback storage
class MemoryStore {
  private store: Map<string, { value: any; expiry?: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private readonly MAX_SIZE = 1000; // ✅ GIỚI HẠN SIZE
  private readonly CLEANUP_INTERVAL = 15 * 60 * 1000; // ✅ 15 PHÚT thay vì 5 phút

  constructor() {
    // ✅ Cleanup expired keys every 15 minutes (giảm từ 5 phút)
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  private cleanup() {
    const now = Date.now();
    let deletedCount = 0;
    
    // ✅ Early exit nếu store nhỏ
    if (this.store.size < 100) {
      return;
    }
    
    // ✅ Cleanup expired keys
    for (const [key, data] of this.store.entries()) {
      if (data.expiry && data.expiry < now) {
        this.store.delete(key);
        deletedCount++;
      }
      
      // ✅ Break early để tránh CPU spike
      if (deletedCount > 100) {
        break;
      }
    }
    
    // ✅ Nếu store vẫn quá lớn, xóa 50% oldest entries
    if (this.store.size > this.MAX_SIZE) {
      const entries = Array.from(this.store.entries());
      const toDelete = Math.floor(entries.length * 0.5);
      
      for (let i = 0; i < toDelete; i++) {
        this.store.delete(entries[i][0]);
      }
      
      console.log(`🧹 Memory store cleanup: removed ${toDelete} entries, size now: ${this.store.size}`);
    }
  }

  set(key: string, value: any, ttlSeconds?: number): void {
    // ✅ Cleanup on demand nếu store gần đầy
    if (this.store.size >= this.MAX_SIZE) {
      this.cleanup();
    }
    
    const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined;
    this.store.set(key, { value, expiry });
  }

  get(key: string): any {
    const data = this.store.get(key);
    if (!data) return null;
    
    if (data.expiry && data.expiry < Date.now()) {
      this.store.delete(key);
      return null;
    }
    
    return data.value;
  }

  del(key: string): void {
    this.store.delete(key);
  }

  incr(key: string): number {
    const current = this.get(key) || 0;
    const newValue = current + 1;
    this.set(key, newValue);
    return newValue;
  }

  exists(key: string): boolean {
    return this.store.has(key) && this.get(key) !== null;
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global in-memory store instance
const memoryStore = new MemoryStore();

// Redis connection with fallback
class RedisWithFallback {
  private redis: Redis;
  private isRedisAvailable: boolean = true;
  private lastRedisCheck: number = 0;
  private checkInterval: number = 30000; // Check every 30 seconds

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  private async checkRedisHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Only check Redis health every 30 seconds to avoid quota waste
    if (now - this.lastRedisCheck < this.checkInterval) {
      return this.isRedisAvailable;
    }

    try {
      // Simple ping test
      await this.redis.ping();
      this.isRedisAvailable = true;
      this.lastRedisCheck = now;
      return true;
    } catch (error) {
      console.warn('Redis health check failed, using memory fallback:', error);
      this.isRedisAvailable = false;
      this.lastRedisCheck = now;
      return false;
    }
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<string | null> {
    try {
      if (await this.checkRedisHealth()) {
        if (options?.ex) {
          return await this.redis.set(key, value, { ex: options.ex });
        } else {
          return await this.redis.set(key, value);
        }
      }
    } catch (error) {
      console.warn(`Redis SET failed for key ${key}, using memory fallback:`, error);
      this.isRedisAvailable = false;
    }

    // Fallback to memory
    memoryStore.set(key, value, options?.ex);
    return 'OK';
  }

  async get(key: string): Promise<any> {
    try {
      if (await this.checkRedisHealth()) {
        return await this.redis.get(key);
      }
    } catch (error) {
      console.warn(`Redis GET failed for key ${key}, using memory fallback:`, error);
      this.isRedisAvailable = false;
    }

    // Fallback to memory
    return memoryStore.get(key);
  }

  async del(key: string): Promise<number> {
    try {
      if (await this.checkRedisHealth()) {
        return await this.redis.del(key);
      }
    } catch (error) {
      console.warn(`Redis DEL failed for key ${key}, using memory fallback:`, error);
      this.isRedisAvailable = false;
    }

    // Fallback to memory
    memoryStore.del(key);
    return 1;
  }

  async incr(key: string): Promise<number> {
    try {
      if (await this.checkRedisHealth()) {
        return await this.redis.incr(key);
      }
    } catch (error) {
      console.warn(`Redis INCR failed for key ${key}, using memory fallback:`, error);
      this.isRedisAvailable = false;
    }

    // Fallback to memory
    return memoryStore.incr(key);
  }

  async exists(key: string): Promise<number> {
    try {
      if (await this.checkRedisHealth()) {
        return await this.redis.exists(key);
      }
    } catch (error) {
      console.warn(`Redis EXISTS failed for key ${key}, using memory fallback:`, error);
      this.isRedisAvailable = false;
    }

    // Fallback to memory
    return memoryStore.exists(key) ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    try {
      if (await this.checkRedisHealth()) {
        return await this.redis.expire(key, seconds);
      }
    } catch (error) {
      console.warn(`Redis EXPIRE failed for key ${key}, using memory fallback:`, error);
      this.isRedisAvailable = false;
    }

    // For memory fallback, we'll update the existing key with TTL
    const value = memoryStore.get(key);
    if (value !== null) {
      memoryStore.set(key, value, seconds);
      return 1;
    }
    return 0;
  }

  // Status methods
  isUsingRedis(): boolean {
    return this.isRedisAvailable;
  }

  isUsingMemory(): boolean {
    return !this.isRedisAvailable;
  }

  getMemoryStoreSize(): number {
    return memoryStore.size();
  }

  clearMemoryStore(): void {
    memoryStore.clear();
  }

  // Force Redis check (useful for manual recovery)
  async forceRedisCheck(): Promise<boolean> {
    this.lastRedisCheck = 0;
    return await this.checkRedisHealth();
  }
}

// Global instance
const redisWithFallback = new RedisWithFallback();

// Rate limiting with fallback
export class RateLimiterWithFallback {
  private identifier: string;
  public readonly limit: number;
  private window: number; // in seconds

  constructor(identifier: string, limit: number, window: number = 60) {
    this.identifier = identifier;
    this.limit = limit;
    this.window = window;
  }

  async checkLimit(key: string): Promise<{ success: boolean; remaining: number; reset: Date }> {
    const redisKey = `ratelimit:${this.identifier}:${key}`;
    const now = Date.now();
    const windowStart = Math.floor(now / (this.window * 1000)) * this.window;
    const windowKey = `${redisKey}:${windowStart}`;

    try {
      // Get current count
      const current = await redisWithFallback.get(windowKey) || 0;
      const count = parseInt(current.toString()) + 1;

      // Set new count with expiration
      await redisWithFallback.set(windowKey, count, { ex: this.window });

      const success = count <= this.limit;
      const remaining = Math.max(0, this.limit - count);
      const reset = new Date((windowStart + this.window) * 1000);

      return { success, remaining, reset };
    } catch (error) {
      console.error('Rate limiting failed:', error);
      // In case of total failure, allow the request but log it
      return { 
        success: true, 
        remaining: this.limit - 1, 
        reset: new Date(now + this.window * 1000) 
      };
    }
  }
}

// Session management with fallback
export class SessionManagerWithFallback {
  async setSession(sessionId: string, data: any, ttlSeconds: number = 1800): Promise<void> {
    const key = `session:${sessionId}`;
    await redisWithFallback.set(key, JSON.stringify(data), { ex: ttlSeconds });
  }

  async getSession(sessionId: string): Promise<any> {
    const key = `session:${sessionId}`;
    const data = await redisWithFallback.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await redisWithFallback.del(key);
  }

  async refreshSession(sessionId: string, ttlSeconds: number = 1800): Promise<boolean> {
    const key = `session:${sessionId}`;
    const exists = await redisWithFallback.exists(key);
    if (exists) {
      await redisWithFallback.expire(key, ttlSeconds);
      return true;
    }
    return false;
  }
}

// Suspicious activity tracking with fallback
export class SuspiciousActivityTrackerWithFallback {
  private threshold: number;
  private blockDuration: number; // in seconds

  constructor(threshold: number = 50, blockDuration: number = 3600) {
    this.threshold = threshold;
    this.blockDuration = blockDuration;
  }

  async trackActivity(ip: string): Promise<{ blocked: boolean; attempts: number }> {
    const key = `suspicious:${ip}`;
    const blockedKey = `blocked:${ip}`;

    // Check if IP is already blocked
    const isBlocked = await redisWithFallback.exists(blockedKey);
    if (isBlocked) {
      return { blocked: true, attempts: this.threshold };
    }

    // Increment attempt count
    const attempts = await redisWithFallback.incr(key);
    
    // Set expiration on first attempt
    if (attempts === 1) {
      await redisWithFallback.expire(key, 3600); // 1 hour window
    }

    // Block if threshold exceeded
    if (attempts >= this.threshold) {
      await redisWithFallback.set(blockedKey, Date.now(), { ex: this.blockDuration });
      return { blocked: true, attempts };
    }

    return { blocked: false, attempts };
  }

  async isBlocked(ip: string): Promise<boolean> {
    const blockedKey = `blocked:${ip}`;
    return (await redisWithFallback.exists(blockedKey)) > 0;
  }

  async unblockIP(ip: string): Promise<void> {
    const blockedKey = `blocked:${ip}`;
    const suspiciousKey = `suspicious:${ip}`;
    await redisWithFallback.del(blockedKey);
    await redisWithFallback.del(suspiciousKey);
  }
}

// Token blacklist with fallback
export class TokenBlacklistWithFallback {
  async blacklistToken(token: string, expiresAt: number): Promise<void> {
    const key = `blacklist:${token}`;
    const ttl = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    if (ttl > 0) {
      await redisWithFallback.set(key, 'blacklisted', { ex: ttl });
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    return (await redisWithFallback.exists(key)) > 0;
  }
}

// Health check and status
export class RedisHealthChecker {
  static async getStatus() {
    const isRedisAvailable = redisWithFallback.isUsingRedis();
    const memoryStoreSize = redisWithFallback.getMemoryStoreSize();
    
    return {
      redis: {
        available: isRedisAvailable,
        status: isRedisAvailable ? 'connected' : 'fallback'
      },
      memory: {
        active: !isRedisAvailable,
        size: memoryStoreSize,
        status: memoryStoreSize > 1000 ? 'high' : 'normal'
      },
      recommendation: isRedisAvailable ? 
        'Redis is working normally' : 
        `Using memory fallback (${memoryStoreSize} keys). Consider upgrading Redis plan.`
    };
  }

  static async forceRedisReconnect(): Promise<boolean> {
    return await redisWithFallback.forceRedisCheck();
  }

  static clearMemoryFallback(): void {
    redisWithFallback.clearMemoryStore();
  }
}

// Export the main instances
export {
  redisWithFallback,
  memoryStore,
  RedisWithFallback,
  MemoryStore
};

// Default export for easy usage
export default redisWithFallback; 