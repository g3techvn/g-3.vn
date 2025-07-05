import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleAuth } from '@/lib/auth/auth-middleware';
import { securityLogger } from '@/lib/logger';

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
    console.log('🔍 Middleware processing:', {
      url: request.url,
      method: request.method,
      path: request.nextUrl.pathname
    });
    // 1. Auth
    const authResult = await withAuth(request);
    if (authResult) {
      return authResult;
    }
    // 2. Prepare response
    const response = NextResponse.next();
    // 3. Security headers
    withSecurityHeaders(response);
    // 4. Cookie security
    withCookieSecurity(response);
    // 5. CORS
    const corsResult = withCORS(request, response);
    if (corsResult) {
      return corsResult;
    }
    // 6. Redirects
    const redirectResult = withRedirects(request);
    if (redirectResult) {
      return redirectResult;
    }
    console.log('✅ Middleware completed successfully for:', request.nextUrl.pathname);
    return response;
  } catch (error) {
    console.error('❌ Error in middleware:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Server error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// --- Refactored helpers ---
async function withAuth(request: NextRequest) {
  return await handleAuth(request);
}

function withSecurityHeaders(response: NextResponse) {
  handleSecurityHeaders(response);
}

function withCookieSecurity(response: NextResponse) {
  enforceCookieSecurity(response);
}

function withCORS(request: NextRequest, response: NextResponse) {
  return handleCORS(request, response);
}

function withRedirects(request: NextRequest) {
  return handleRedirects(request);
}

function handleSecurityHeaders(response: NextResponse) {
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');
  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions-Policy (deprecated, but still widely used)
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  // Strict-Transport-Security
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // Cross-Origin-Resource-Policy
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  // Content-Security-Policy (bổ sung 'unsafe-inline' cho script, Google Fonts cho style/font)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self' https://g-3.vn https://www.g-3.vn;",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://cdn.jsdelivr.net;",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://www.gstatic.com blob:;",
      "img-src 'self' data: https: blob: https://file.hstatic.net;",
      "font-src 'self' data: https://fonts.gstatic.com https://www.gstatic.com https://cdn.jsdelivr.net blob:;",
      "connect-src 'self' https: wss:;",
      "media-src 'self' https:;",
      "object-src 'none';",
      "base-uri 'self';",
      "form-action 'self';",
      "frame-src 'self' https://www.facebook.com https://www.youtube.com;"
    ].join(' ')
  );
  // X-Permitted-Cross-Domain-Policies
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  // X-DNS-Prefetch-Control
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  // X-Download-Options (IE/Edge)
  response.headers.set('X-Download-Options', 'noopen');
  // Expect-CT (chỉ nên bật nếu dùng HTTPS công khai)
  response.headers.set('Expect-CT', 'max-age=86400, enforce');
  // Ẩn Server header nếu có thể (Next.js không cho set trực tiếp, cần cấu hình server custom nếu muốn)
}

function enforceCookieSecurity(response: NextResponse) {
  // Lấy tất cả cookie trong header
  const setCookieHeader = response.headers.get('Set-Cookie');
  if (setCookieHeader) {
    // Tách từng cookie
    const cookies = setCookieHeader.split(',').map(cookie => {
      // Chỉ sửa cookie auth hoặc custom nhạy cảm
      if (
        cookie.includes('sb-access-token') ||
        cookie.includes('auth-session') ||
        cookie.includes('sb-refresh-token')
      ) {
        // Đảm bảo có Secure, HttpOnly, SameSite=Strict
        let newCookie = cookie;
        if (!/;\s*Secure/i.test(newCookie)) newCookie += '; Secure';
        if (!/;\s*HttpOnly/i.test(newCookie)) newCookie += '; HttpOnly';
        if (!/;\s*SameSite=/i.test(newCookie)) newCookie += '; SameSite=Strict';
        return newCookie;
      }
      return cookie;
    });
    response.headers.set('Set-Cookie', cookies.join(','));
  }
}

function handleCORS(request: NextRequest, response: NextResponse) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }
  return null;
}

function handleRedirects(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/uu-dai') {
    return NextResponse.redirect(new URL('/voucher', request.url));
  }
  return null;
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