import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSecurityHeaders } from '@/lib/rate-limit';
import { authenticateRequest, requireAuth, requireAdmin } from '@/lib/auth/auth-middleware';

// This middleware runs on every request
export async function middleware(request: NextRequest) {
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
                    "connect-src 'self' https://jjraznkvgfsgqrqvlcwo.supabase.co https://www.google-analytics.com",
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

// Optimize matcher to exclude static resources
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}; 