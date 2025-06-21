import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getEnhancedSecurityHeaders, enhancedRateLimit } from '@/lib/security/redis-rate-limit';
import { createAPISecurityMiddleware, enhanceResponseSecurity } from '@/lib/security/api-security';
import { createAuthMiddleware } from '@/lib/auth/enhanced-auth';
import { 
  authenticateRequest, 
  requireAuth, 
  requireAdmin 
} from '@/lib/auth/auth-middleware';

// ✅ Cache domain info to avoid repeated calculations
let cachedDomainInfo: { domain: string; timestamp: number } | null = null;
const DOMAIN_CACHE_TTL = 60 * 1000; // Cache for 1 minute

// ✅ Optimize domain detection with caching
function getCachedDomain(): string {
  const now = Date.now();
  
  // Return cached domain if still valid
  if (cachedDomainInfo && (now - cachedDomainInfo.timestamp) < DOMAIN_CACHE_TTL) {
    return cachedDomainInfo.domain;
  }
  
  // Update cache
  const g3Domain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
  cachedDomainInfo = {
    domain: g3Domain,
    timestamp: now
  };
  
  return g3Domain;
}

// ✅ Reduce logging frequency
let lastLogTime = 0;
const LOG_THROTTLE_MS = 5000; // Only log once every 5 seconds

function throttledLog(message: string) {
  const now = Date.now();
  if (now - lastLogTime > LOG_THROTTLE_MS) {
    console.log(message);
    lastLogTime = now;
  }
}

// This middleware runs on every request
export async function middleware(request: NextRequest) {
  // ✅ Get cached domain info
  const g3Domain = getCachedDomain();
  
  // ✅ Only log domain info occasionally (throttled)
  if (process.env.NODE_ENV === 'development') {
    throttledLog(`Middleware - Using domain: ${g3Domain}`);
  }
  
  // Handle authentication and authorization
  const authContext = await authenticateRequest(request);
  
  // Check if route requires authentication
  const authResponse = requireAuth(authContext, request);
  if (authResponse) {
    return authResponse;
  }
  
  // Check if route requires admin privileges
  const adminResponse = requireAdmin(authContext, request);
  if (adminResponse) {
    return adminResponse;
  }
  
  // Get the current URL
  const url = new URL(request.url);
  
  // ✅ Optimize API parameter injection - only for specific endpoints
  const shouldInjectDomain = (
    url.pathname.startsWith('/api/') && 
      !url.searchParams.has('domain') &&
    !url.searchParams.has('use_domain') &&
    // ✅ Only inject for endpoints that actually need domain filtering
    (url.pathname === '/api/products' || 
     url.pathname === '/api/categories' ||
     url.pathname.startsWith('/api/sectors'))
  );
  
  if (shouldInjectDomain) {
    // Clone the URL to modify it
    const newUrl = new URL(url);
    
    // Add domain as a query parameter - using the cached domain
    newUrl.searchParams.set('domain', g3Domain);
    
    // If it's a direct product API call, enable domain-based filtering
    if (url.pathname === '/api/products' && !url.searchParams.has('sector_id')) {
      newUrl.searchParams.set('use_domain', 'true');
    }
    
    // Rewrite the URL with the new params and add security headers
    const rewriteResponse = NextResponse.rewrite(newUrl);
    
    // Add security headers to rewrite response too
    const securityHeaders = getEnhancedSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      rewriteResponse.headers.set(key, value);
    });
    
    return rewriteResponse;
  }
  
  // Continue with the request and add security headers
  const response = NextResponse.next();
  
  // Add security headers to all responses
  const securityHeaders = getEnhancedSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CSP header for extra security
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://static.g-3.vn https://www.google-analytics.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspHeader);
  
  return response;
}

// ✅ Optimize matcher to exclude more static resources
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public folder files
     * - API routes that don't need domain injection
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/brands/id|api/web-vitals|api/images).*)'
  ]
}; 