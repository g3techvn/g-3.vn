import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleAuth } from '@/lib/auth/auth-middleware';
import { securityLogger } from '@/lib/logger';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/products',
  '/api/categories',
  '/api/brands',
  '/api/sectors',
  '/api/combo-products'
];

// Routes that require authentication  
const PROTECTED_ROUTES = [
  '/api/user',
  '/api/orders',
  '/api/user/orders',
  '/api/user/rewards',
  '/tai-khoan'
];

// Routes that require admin role
const ADMIN_ROUTES = [
  '/api/admin',
  '/admin'
];

// Simplified domain validation for development
function validateRequestOrigin(request: NextRequest): boolean {
  // In development, allow all requests
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Allow requests without origin/referer for API calls
  if (!origin && !referer) {
    return true;
  }
  
  // In production, add domain validation here
  return true;
}

// This middleware runs on every request
export async function middleware(request: NextRequest) {
  try {
    // Create a response early so we can modify headers
    const response = NextResponse.next();

    // Create Supabase client with response header mutation enabled
    const supabase = createMiddlewareClient({ req: request, res: response });

    // Refresh session if expired - will update response headers if successful
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session error in middleware:', sessionError);
    }

    // Log request details for debugging
    console.log('🔍 Middleware request:', {
      url: request.url,
      method: request.method,
      hasSession: !!session,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll().map(c => c.name)
    });

    // Check if the request path matches any protected routes
    const requestPath = new URL(request.url).pathname;
    const isProtectedRoute = PROTECTED_ROUTES.some(route => requestPath.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some(route => requestPath.startsWith(route));

    // If it's a protected route and there's no session, return 401
    if (isProtectedRoute && !session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // If it's an admin route, check for admin role
    if (isAdminRoute) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.user_metadata?.role !== 'admin') {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized - Admin access required' }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Add CORS headers for API routes
    if (request.url.includes('/api/')) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
      response.headers.set(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
      );
    }

    // Get the pathname of the request (e.g. /, /about, /blog/first-post)
    const path = request.nextUrl.pathname;

    // Redirect /uu-dai to /voucher
    if (path === '/uu-dai') {
      return NextResponse.redirect(new URL('/voucher', request.url));
    }

    // Return response with updated headers and session
    return response;

  } catch (error) {
    console.error('❌ Error in middleware:', error);
    
    // Return error response
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

function addSecurityHeaders(response: NextResponse) {
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // CORS headers for API routes
  const origin = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : `https://${process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost'}`;

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Add CSP header with relaxed settings for auth
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.supabase.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://www.google-analytics.com wss://*.supabase.co",
    "frame-src 'self' https://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspHeader);

  // Set SameSite and Secure attributes for cookies
  const cookieHeader = response.headers.get('Set-Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(',').map(cookie => {
      if (cookie.includes('supabase') || cookie.includes('sb-')) {
        return `${cookie}; SameSite=Lax; Secure`;
      }
      return cookie;
    });
    response.headers.set('Set-Cookie', cookies.join(','));
  }
}

function handleAuthError(message: string, status: number, additionalHeaders: Record<string, string> = {}) {
  return new NextResponse(
    JSON.stringify({ error: message }),
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        ...additionalHeaders
      }
    }
  );
}

// Configure middleware matching
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/public (public API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/public).*)',
    '/uu-dai'
  ],
}; 