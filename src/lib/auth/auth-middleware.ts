import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { securityLogger, logSuspiciousRequest } from '@/lib/logger';
import { getClientIP } from '@/lib/rate-limit';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role?: string;
  } | null;
  isAuthenticated: boolean;
}

// Routes that require authentication
const PROTECTED_ROUTES: string[] = [
  '/api/user',
  '/tai-khoan',
  '/api/user/rewards'
];

// Routes that require admin role
const ADMIN_ROUTES = [
  '/api/admin',
  '/admin'
];

export async function authenticateRequest(request: NextRequest): Promise<AuthContext> {
  try {
    // Get Supabase session tokens from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value ||
                       request.cookies.get('supabase-auth-token')?.value ||
                       request.cookies.get('sb-127-0-0-1-3000-auth-token')?.value;

    if (!accessToken) {
      return { user: null, isAuthenticated: false };
    }

    // Create client and verify token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return { user: null, isAuthenticated: false };
    }

    return {
      user: {
        id: user.id,
        email: user.email!,
        role: user.user_metadata?.role || 'user'
      },
      isAuthenticated: true
    };
  } catch (error) {
    securityLogger.logError('Authentication error', error as Error, {
      ip: getClientIP(request),
      endpoint: request.nextUrl.pathname
    });
    
    return { user: null, isAuthenticated: false };
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
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (authContext.user?.role !== 'admin') {
      const ip = getClientIP(request);
      logSuspiciousRequest(
        ip,
        pathname,
        'Attempted access to admin route without admin role',
        request.headers.get('user-agent') || undefined
      );
      
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
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