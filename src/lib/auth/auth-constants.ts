/**
 * Authentication and Authorization Constants
 * Centralized configuration for all auth-related routes and settings
 */

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/api/user',
  '/api/orders', 
  '/api/user/orders',
  '/api/user/rewards',
  '/api/user/addresses',
  '/api/admin',
  '/tai-khoan',
  '/don-hang'
] as const;

// Admin-only routes that require admin role
export const ADMIN_ROUTES = [
  '/api/admin',
  '/admin'
] as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/api/products',
  '/api/categories',
  '/api/brands',
  '/api/sectors',
  '/api/payment-methods',
  '/api/shipping-carriers',
  '/api/vouchers',
  '/api/promotion',
  '/api/combo-products',
  '/dang-nhap',
  '/dang-ky',
  '/',
  '/san-pham',
  '/categories',
  '/brands',
  '/lien-he',
  '/about'
] as const;

// Auth configuration
export const AUTH_CONFIG = {
  // Session settings
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Security settings
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Cookie settings
  COOKIE_NAME: 'auth-session',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60, // 7 days in seconds
  
  // Headers
  AUTH_HEADER: 'Authorization',
  BEARER_PREFIX: 'Bearer ',
  
  // Error messages
  ERRORS: {
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden - Admin access required',
    SESSION_EXPIRED: 'Session expired',
    INVALID_TOKEN: 'Invalid or expired token',
    MISSING_TOKEN: 'Missing authorization token'
  }
} as const;

// Helper functions
export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
}

export function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some(route => path.startsWith(route));
}

export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route));
}

export function isApiRoute(path: string): boolean {
  return path.startsWith('/api/');
}