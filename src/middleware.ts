import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSecurityHeaders } from '@/lib/rate-limit';
import { 
  authenticateRequest, 
  requireAuth, 
  requireAdmin 
} from '@/lib/auth/auth-middleware';

// This middleware runs on every request
export async function middleware(request: NextRequest) {
  // Get the hostname (domain or subdomain) - for info only
  const host = request.headers.get('host') || '';
  const domain = host.split(':')[0]; // Remove port if present
  
  // Use environment variable for domain instead of actual request domain
  const g3Domain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
  
  // You can log domain information for debugging
  console.log('Middleware - Using domain:', g3Domain);
  
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
  
  // For API calls that should include domain information
  // but don't already have it, add it as a query parameter
  if (url.pathname.startsWith('/api/') && 
      !url.searchParams.has('domain') &&
      !url.searchParams.has('use_domain')) {
    // Clone the URL to modify it
    const newUrl = new URL(url);
    
    // Add domain as a query parameter - using the environment variable
    newUrl.searchParams.set('domain', g3Domain);
    
    // If it's a direct product API call, enable domain-based filtering
    if (url.pathname === '/api/products' && !url.searchParams.has('sector_id')) {
      newUrl.searchParams.set('use_domain', 'true');
    }
    
    // Rewrite the URL with the new params and add security headers
    const rewriteResponse = NextResponse.rewrite(newUrl);
    
    // Add security headers to rewrite response too
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      rewriteResponse.headers.set(key, value);
    });
    
    return rewriteResponse;
  }
  
  // Continue with the request and add security headers
  const response = NextResponse.next();
  
  // Add security headers to all responses
  const securityHeaders = getSecurityHeaders();
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

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}; 