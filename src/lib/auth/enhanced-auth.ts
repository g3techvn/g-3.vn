import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

// In-memory storage
const tokenStore = new Map<string, string>();
const sessionStore = new Map<string, any>();
const deviceStore = new Map<string, any>();
const blacklistStore = new Map<string, number>();

// Auth configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
);

const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m', // 15 minutes
  REFRESH_TOKEN_EXPIRY: '7d', // 7 days
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
  MAX_DEVICES_PER_USER: 5, // Maximum concurrent devices
  REFRESH_TOKEN_PREFIX: 'refresh:',
  SESSION_PREFIX: 'session:',
  USER_DEVICES_PREFIX: 'devices:',
  BLACKLIST_PREFIX: 'blacklist:',
};

// Types
interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
  deviceId: string;
  sessionId: string;
  [key: string]: any;
}

interface RefreshTokenData {
  userId: string;
  deviceId: string;
  sessionId: string;
  createdAt: number;
  lastUsed: number;
  userAgent?: string;
  ip?: string;
}

interface SessionData {
  userId: string;
  deviceId: string;
  lastActivity: number;
  ip: string;
  userAgent: string;
  isActive: boolean;
}

interface DeviceInfo {
  deviceId: string;
  sessionId: string;
  userAgent: string;
  ip: string;
  loginAt: number;
  lastActivity: number;
  isActive: boolean;
}

export class EnhancedAuthManager {
  // Helper methods for storage
  private setWithExpiry(store: Map<string, any>, key: string, value: any, expirySeconds: number) {
    const item = {
      value,
      expiry: Date.now() + (expirySeconds * 1000)
    };
    store.set(key, JSON.stringify(item));
  }

  private getWithExpiry(store: Map<string, any>, key: string) {
    const itemStr = store.get(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      store.delete(key);
      return null;
    }
    return item.value;
  }

  // Generate device ID from user agent and IP
  private generateDeviceId(userAgent: string, ip: string): string {
    const deviceString = `${userAgent}-${ip}`;
    return Buffer.from(deviceString).toString('base64').slice(0, 32);
  }

  // Generate session ID
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Create access token
  async createAccessToken(payload: TokenPayload): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(AUTH_CONFIG.ACCESS_TOKEN_EXPIRY)
      .sign(JWT_SECRET);
  }

  // Create refresh token
  async createRefreshToken(
    userId: string,
    deviceId: string,
    sessionId: string,
    userAgent?: string,
    ip?: string
  ): Promise<string> {
    const refreshToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const key = `${AUTH_CONFIG.REFRESH_TOKEN_PREFIX}${refreshToken}`;
    
    const tokenData: RefreshTokenData = {
      userId,
      deviceId,
      sessionId,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      userAgent,
      ip,
    };

    // Store refresh token with 7 days expiry
    this.setWithExpiry(tokenStore, key, tokenData, 7 * 24 * 60 * 60);
    
    return refreshToken;
  }

  // Verify access token
  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return null;
      }

      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as unknown as TokenPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Verify refresh token
  async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenData | null> {
    try {
      const key = `${AUTH_CONFIG.REFRESH_TOKEN_PREFIX}${refreshToken}`;
      const data = this.getWithExpiry(tokenStore, key);
      
      if (!data) {
        return null;
      }

      const tokenData = data as RefreshTokenData;
      
      // Update last used timestamp
      tokenData.lastUsed = Date.now();
      this.setWithExpiry(tokenStore, key, tokenData, 7 * 24 * 60 * 60);
      
      return tokenData;
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  // Login with multi-device tracking
  async login(
    userId: string,
    email: string,
    request: NextRequest,
    role?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    deviceId: string;
    sessionId: string;
  }> {
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = this.getClientIP(request);
    const deviceId = this.generateDeviceId(userAgent, ip);
    const sessionId = this.generateSessionId();

    // Check device limit
    await this.enforceDeviceLimit(userId, deviceId);

    // Create tokens
    const tokenPayload: TokenPayload = {
      userId,
      email,
      role,
      deviceId,
      sessionId,
    };

    const accessToken = await this.createAccessToken(tokenPayload);
    const refreshToken = await this.createRefreshToken(
      userId,
      deviceId,
      sessionId,
      userAgent,
      ip
    );

    // Create session
    await this.createSession(userId, deviceId, sessionId, ip, userAgent);

    // Track device
    await this.trackDevice(userId, deviceId, sessionId, userAgent, ip);

    console.log(`✅ User ${userId} logged in from device ${deviceId}`);

    return {
      accessToken,
      refreshToken,
      deviceId,
      sessionId,
    };
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    const tokenData = await this.verifyRefreshToken(refreshToken);
    if (!tokenData) {
      return null;
    }

    // Check if session is still active
    const session = await this.getSession(tokenData.sessionId);
    if (!session || !session.isActive) {
      return null;
    }

    // Update session activity
    await this.updateSessionActivity(tokenData.sessionId);

    // Create new tokens
    const tokenPayload: TokenPayload = {
      userId: tokenData.userId,
      email: '', // Will be filled from user data
      deviceId: tokenData.deviceId,
      sessionId: tokenData.sessionId,
    };

    const newAccessToken = await this.createAccessToken(tokenPayload);
    const newRefreshToken = await this.createRefreshToken(
      tokenData.userId,
      tokenData.deviceId,
      tokenData.sessionId,
      tokenData.userAgent,
      tokenData.ip
    );

    // Invalidate old refresh token
    await this.invalidateRefreshToken(refreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // Logout from specific device
  async logout(userId: string, deviceId: string, sessionId: string): Promise<void> {
    // Invalidate session
    await this.invalidateSession(sessionId);

    // Remove device tracking
    await this.removeDeviceTracking(userId, deviceId);

    // Invalidate all refresh tokens for this session
    const refreshKeys = tokenStore.keys();
    for (const key of refreshKeys) {
      const data = this.getWithExpiry(tokenStore, key);
      if (data && data.sessionId === sessionId) {
        tokenStore.delete(key);
      }
    }

    console.log(`🚪 User ${userId} logged out from device ${deviceId}`);
  }

  // Logout from all devices
  async logoutAllDevices(userId: string): Promise<void> {
    // Get all user devices
    const devices = await this.getUserDevices(userId);

    // Invalidate all sessions and refresh tokens
    for (const device of devices) {
      await this.invalidateSession(device.sessionId);
      
      // Find and invalidate refresh tokens
      const refreshKeys = tokenStore.keys();
      for (const key of refreshKeys) {
        const data = this.getWithExpiry(tokenStore, key);
        if (data && data.userId === userId) {
          tokenStore.delete(key);
        }
      }
    }

    // Clear device tracking
    deviceStore.delete(`${AUTH_CONFIG.USER_DEVICES_PREFIX}${userId}`);

    console.log(`🚪 User ${userId} logged out from all devices`);
  }

  // Session management
  private async createSession(
    userId: string,
    deviceId: string,
    sessionId: string,
    ip: string,
    userAgent: string
  ): Promise<void> {
    const sessionData: SessionData = {
      userId,
      deviceId,
      lastActivity: Date.now(),
      ip,
      userAgent,
      isActive: true,
    };

    const key = `${AUTH_CONFIG.SESSION_PREFIX}${sessionId}`;
    this.setWithExpiry(sessionStore, key, sessionData, Math.ceil(AUTH_CONFIG.SESSION_TIMEOUT / 1000));
  }

  private async getSession(sessionId: string): Promise<SessionData | null> {
    const key = `${AUTH_CONFIG.SESSION_PREFIX}${sessionId}`;
    const data = this.getWithExpiry(sessionStore, key);
    
    if (!data) {
      return null;
    }

    return data as SessionData;
  }

  private async updateSessionActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return;
    }

    session.lastActivity = Date.now();
    const key = `${AUTH_CONFIG.SESSION_PREFIX}${sessionId}`;
    this.setWithExpiry(sessionStore, key, session, Math.ceil(AUTH_CONFIG.SESSION_TIMEOUT / 1000));
  }

  private async invalidateSession(sessionId: string): Promise<void> {
    const key = `${AUTH_CONFIG.SESSION_PREFIX}${sessionId}`;
    sessionStore.delete(key);
  }

  // Device tracking
  private async trackDevice(
    userId: string,
    deviceId: string,
    sessionId: string,
    userAgent: string,
    ip: string
  ): Promise<void> {
    const key = `${AUTH_CONFIG.USER_DEVICES_PREFIX}${userId}`;
    const devices = await this.getUserDevices(userId);
    
    const deviceInfo: DeviceInfo = {
      deviceId,
      sessionId,
      userAgent,
      ip,
      loginAt: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
    };

    // Remove existing device if exists
    const filteredDevices = devices.filter(d => d.deviceId !== deviceId);
    filteredDevices.push(deviceInfo);

    this.setWithExpiry(deviceStore, key, filteredDevices, 7 * 24 * 60 * 60);
  }

  private async removeDeviceTracking(userId: string, deviceId: string): Promise<void> {
    const key = `${AUTH_CONFIG.USER_DEVICES_PREFIX}${userId}`;
    const devices = await this.getUserDevices(userId);
    
    const filteredDevices = devices.filter(d => d.deviceId !== deviceId);
    
    if (filteredDevices.length > 0) {
      this.setWithExpiry(deviceStore, key, filteredDevices, 7 * 24 * 60 * 60);
    } else {
      deviceStore.delete(key);
    }
  }

  private async enforceDeviceLimit(userId: string, newDeviceId: string): Promise<void> {
    const devices = await this.getUserDevices(userId);
    
    if (devices.length >= AUTH_CONFIG.MAX_DEVICES_PER_USER) {
      // Remove oldest inactive device
      const inactiveDevices = devices
        .filter(d => !d.isActive)
        .sort((a, b) => a.lastActivity - b.lastActivity);
      
      if (inactiveDevices.length > 0) {
        const oldestDevice = inactiveDevices[0];
        await this.removeDeviceTracking(userId, oldestDevice.deviceId);
        await this.invalidateSession(oldestDevice.sessionId);
      } else {
        // Force logout oldest active device
        const oldestDevice = devices.sort((a, b) => a.lastActivity - b.lastActivity)[0];
        await this.logout(userId, oldestDevice.deviceId, oldestDevice.sessionId);
      }
    }
  }

  async getUserDevices(userId: string): Promise<DeviceInfo[]> {
    const key = `${AUTH_CONFIG.USER_DEVICES_PREFIX}${userId}`;
    const data = this.getWithExpiry(deviceStore, key);
    
    if (!data) {
      return [];
    }

    return data as DeviceInfo[];
  }

  // Token blacklisting
  private async blacklistToken(token: string, expiry: number): Promise<void> {
    const key = `${AUTH_CONFIG.BLACKLIST_PREFIX}${token}`;
    this.setWithExpiry(blacklistStore, key, expiry, Math.ceil(expiry / 1000));
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${AUTH_CONFIG.BLACKLIST_PREFIX}${token}`;
    const expiry = this.getWithExpiry(blacklistStore, key);
    return expiry !== null;
  }

  private async invalidateRefreshToken(refreshToken: string): Promise<void> {
    const key = `${AUTH_CONFIG.REFRESH_TOKEN_PREFIX}${refreshToken}`;
    tokenStore.delete(key);
  }

  // Helper methods
  private getClientIP(request: NextRequest): string {
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
    
    return 'unknown';
  }

  // Session timeout checker
  async checkSessionTimeout(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return true; // Session expired
    }

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    
    if (timeSinceLastActivity > AUTH_CONFIG.SESSION_TIMEOUT) {
      await this.invalidateSession(sessionId);
      return true; // Session timed out
    }

    return false; // Session still active
  }

  // Get session statistics
  async getSessionStats(userId: string): Promise<{
    totalDevices: number;
    activeDevices: number;
    activeSessions: number;
  }> {
    const devices = await this.getUserDevices(userId);
    const activeDevices = devices.filter(d => d.isActive);
    
    let activeSessions = 0;
    for (const device of activeDevices) {
      const session = await this.getSession(device.sessionId);
      if (session && session.isActive) {
        activeSessions++;
      }
    }

    return {
      totalDevices: devices.length,
      activeDevices: activeDevices.length,
      activeSessions,
    };
  }
}

// Middleware for authentication
export function createAuthMiddleware() {
  return async (request: NextRequest) => {
    const authManager = new EnhancedAuthManager();
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await authManager.verifyAccessToken(token);
    
    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401 }
      );
    }

    // Check session timeout
    const isExpired = await authManager.checkSessionTimeout(payload.sessionId);
    if (isExpired) {
      return new Response(
        JSON.stringify({ error: 'Session expired' }),
        { status: 401 }
      );
    }

    // Add user info to request headers for downstream handlers
    const headers = new Headers(request.headers);
    headers.set('x-user-id', payload.userId);
    headers.set('x-device-id', payload.deviceId);
    headers.set('x-session-id', payload.sessionId);

    return null; // Continue to next middleware
  };
}

export { AUTH_CONFIG }; 