import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { securityLogger, logSuspiciousRequest } from '@/lib/logger';
import { getClientIP, rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const PROTECTED_ROUTES = [
  '/api/user',
  '/api/orders',
  '/api/admin',
  '/tai-khoan',
  '/don-hang'
];

const ADMIN_ROUTES = [
  '/api/admin',
  '/admin'
];

interface AuthUser {
  id: string;
  email: string;
  phone?: string | null;
  role?: string;
}

interface AuthContext {
  user: AuthUser | null;
  session: any | null;
  isAuthenticated: boolean;
  response?: NextResponse;
}

interface CookieOptions {
  name: string;
  value: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  domain?: string;
  sameSite?: 'strict' | 'lax' | 'none';
}

// Rate limit configurations for different routes
const ROUTE_RATE_LIMITS = {
  '/api/products': RATE_LIMITS.API_GENERAL,
  '/api/orders': RATE_LIMITS.API_GENERAL
};

// Function for API routes to authenticate requests
export async function authenticateRequest(request: Request): Promise<AuthContext> {
  console.log('🔍 Starting authenticateRequest for:', request.url);
  
  try {
    // Create server client
    const supabase = createServerComponentClient({ cookies });

    // Get session and user data
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      throw sessionError;
    }

    if (!session) {
      console.log('❌ No active session found');
      throw new Error('No active session');
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User error:', userError);
      throw userError || new Error('User not found');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      phone: user.phone || null,
      role: user.user_metadata?.role || 'user'
    };

    console.log('✅ Authentication successful for user:', authUser.id);
    return { user: authUser, session, isAuthenticated: true };

  } catch (error) {
    console.error('❌ Authentication failed:', error);
    
    // Check if route requires authentication
    const path = new URL(request.url).pathname;
    const requiresAuth = PROTECTED_ROUTES.some(route => path.startsWith(route));
    
    if (requiresAuth) {
      console.log('🔒 Auth required but no user found for path:', path);
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: {
            'WWW-Authenticate': 'Bearer error="invalid_token"',
            'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
      return { user: null, session: null, isAuthenticated: false, response };
    }
    
    return { user: null, session: null, isAuthenticated: false };
  }
}

// Function for middleware to handle auth
export async function handleAuth(request: NextRequest) {
  try {
    // Create server client
    const supabase = createServerComponentClient({ cookies });

    // Get session and user data
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      throw sessionError;
    }

    // Check if the path requires authentication
    const path = request.nextUrl.pathname;
    const requiresAuth = PROTECTED_ROUTES.some(route => path.startsWith(route));
    const requiresAdmin = ADMIN_ROUTES.some(route => path.startsWith(route));

    // Check authentication requirements
    if (requiresAuth && !session) {
      console.log('🔒 Auth required but no session found for path:', path);
      if (path.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        // For non-API routes, redirect to login
        return NextResponse.redirect(new URL('/dang-nhap', request.url));
      }
    }

    // If session exists, get user data
    if (session) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // Check admin role requirement
      if (requiresAdmin && (!user || user.user_metadata?.role !== 'admin')) {
        console.log('👮‍♂️ Admin required but user is not admin:', user?.email);
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('✅ Auth check passed for:', path);
    return NextResponse.next();
  } catch (error) {
    console.error('❌ Error in auth middleware:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export function requireAuth(authContext: AuthContext, request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  
  // Skip auth check for login page to prevent redirect loop
  if (pathname.startsWith('/dang-nhap')) {
    return null;
  }
  
  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute && !authContext.isAuthenticated) {
    const ip = getClientIP(request);
    logSuspiciousRequest(
      ip,
      pathname,
      'Attempted access to protected route without authentication',
      request.headers.get('user-agent') || undefined
    );

    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For pages, redirect to login with return URL
    const loginUrl = new URL('/dang-nhap', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return null;
}

export function requireAdmin(authContext: AuthContext, request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  
  // Check if route requires admin role
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  if (isAdminRoute) {
    if (!authContext.isAuthenticated) {
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // For pages, redirect to login with return URL
      const loginUrl = new URL('/dang-nhap', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (authContext.user?.role !== 'admin') {
      const ip = getClientIP(request);
      logSuspiciousRequest(
        ip,
        pathname,
        'Attempted access to admin route without admin role',
        request.headers.get('user-agent') || undefined
      );
      
      // For API routes, return 403
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Admin privileges required' },
          { status: 403 }
        );
      }
      
      // For pages, let component handle the error display
      // We'll pass the error info via headers
      const response = NextResponse.next();
      response.headers.set('X-Auth-Error', 'insufficient-privileges');
      return response;
    }
  }

  return null;
}

// Rate limiting for authenticated vs unauthenticated users
export function getAuthBasedRateLimit(authContext: AuthContext) {
  if (authContext.isAuthenticated) {
    // Authenticated users get higher limits
    return {
      interval: 60000, // 1 minute
      uniqueTokenPerInterval: authContext.user?.role === 'admin' ? 1000 : 200
    };
  } else {
    // Unauthenticated users get stricter limits
    return {
      interval: 60000, // 1 minute  
      uniqueTokenPerInterval: 50
    };
  }
}

// Check for suspicious patterns
export function detectSuspiciousActivity(request: NextRequest, authContext: AuthContext): string | null {
  const userAgent = request.headers.get('user-agent') || '';
  const ip = getClientIP(request);
  
  // Check for bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /php/i
  ];
  
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  if (isBot && request.nextUrl.pathname.startsWith('/api/orders')) {
    return 'Bot attempting to access order creation';
  }
  
  // Check for missing common headers
  const hasReferer = request.headers.get('referer');
  const hasAccept = request.headers.get('accept');
  
  if (!hasReferer && !hasAccept && request.method === 'POST') {
    return 'Missing common browser headers in POST request';
  }
  
  // Check for rapid requests from same IP (basic check)
  // In production, you'd use Redis to track this properly
  
  return null;
} 