import { createHash } from 'crypto';

// Use stateless token approach instead of in-memory storage
export function generateOrderToken(orderId: string): string {
  const secret = process.env.ORDER_ACCESS_SECRET || 'fallback-secret-key-change-in-production';
  const timestamp = Date.now();
  const expiresAt = timestamp + (24 * 60 * 60 * 1000); // 24 hours
  
  // Create a payload with order ID and expiration
  const payload = `${orderId}:${expiresAt}`;
  
  // Create HMAC signature
  const signature = createHash('sha256')
    .update(payload + secret)
    .digest('hex')
    .substring(0, 16);
  
  // Combine payload and signature, encode as base64
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  
  return token;
}

export function validateOrderToken(token: string): { valid: boolean; orderId?: string; error?: string } {
  try {
    const secret = process.env.ORDER_ACCESS_SECRET || 'fallback-secret-key-change-in-production';
    
    // Decode token
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split(':');
    
    if (parts.length !== 3) {
      return { valid: false, error: 'Token không hợp lệ' };
    }
    
    const [orderId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr);
    
    // Check expiration
    if (Date.now() > expiresAt) {
      return { valid: false, error: 'Token đã hết hạn' };
    }
    
    // Verify signature
    const payload = `${orderId}:${expiresAtStr}`;
    const expectedSignature = createHash('sha256')
      .update(payload + secret)
      .digest('hex')
      .substring(0, 16);
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Token không hợp lệ' };
    }
    
    return { valid: true, orderId };
    
  } catch (error) {
    return { valid: false, error: 'Token không hợp lệ' };
  }
}

export function markTokenAsUsed(token: string): void {
  // With stateless tokens, we don't need to mark as used
  // If you need one-time use, implement a blacklist in database
}

export function createSecureOrderHash(orderId: string, userInfo: any): string {
  // Create a hash based on order ID + user info + secret
  const secret = process.env.ORDER_ACCESS_SECRET || 'fallback-secret';
  const dataToHash = `${orderId}-${userInfo.phone}-${userInfo.email}-${secret}`;
  return createHash('sha256').update(dataToHash).digest('hex').substring(0, 16);
} 