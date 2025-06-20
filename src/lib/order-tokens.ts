import { createHash, randomBytes } from 'crypto';

interface OrderToken {
  orderId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

// In-memory store for tokens (in production, use Redis or database)
const orderTokens = new Map<string, OrderToken>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [token, data] of orderTokens.entries()) {
    if (data.expiresAt < now) {
      orderTokens.delete(token);
    }
  }
}, 5 * 60 * 1000);

export function generateOrderToken(orderId: string): string {
  // Generate cryptographically secure random token
  const token = randomBytes(32).toString('hex');
  
  // Token expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  orderTokens.set(token, {
    orderId,
    token,
    expiresAt,
    used: false
  });
  
  return token;
}

export function validateOrderToken(token: string): { valid: boolean; orderId?: string; error?: string } {
  const tokenData = orderTokens.get(token);
  
  if (!tokenData) {
    return { valid: false, error: 'Token không tồn tại hoặc đã hết hạn' };
  }
  
  if (tokenData.expiresAt < new Date()) {
    orderTokens.delete(token);
    return { valid: false, error: 'Token đã hết hạn' };
  }
  
  if (tokenData.used) {
    return { valid: false, error: 'Token đã được sử dụng' };
  }
  
  return { valid: true, orderId: tokenData.orderId };
}

export function markTokenAsUsed(token: string): void {
  const tokenData = orderTokens.get(token);
  if (tokenData) {
    tokenData.used = true;
  }
}

export function createSecureOrderHash(orderId: string, userInfo: any): string {
  // Create a hash based on order ID + user info + secret
  const secret = process.env.ORDER_ACCESS_SECRET || 'fallback-secret';
  const dataToHash = `${orderId}-${userInfo.phone}-${userInfo.email}-${secret}`;
  return createHash('sha256').update(dataToHash).digest('hex').substring(0, 16);
} 