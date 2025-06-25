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
  '/admin',
  '/don-hang'
];

export async function authenticateRequest(request: NextRequest): Promise<AuthContext> {
  try {
    // Create server-side Supabase client to get session from cookies
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Create client that can read cookies properly
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: 'pkce'
      }
    });

    // Try to get session - this will read the appropriate cookies automatically
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    let userInfo = null;
    
    if (sessionError || !session) {
      // If no session from cookies, try to get user from header token
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        console.log('🔑 No auth header found in middleware');
        return { user: null, isAuthenticated: false };
      }
      
      const token = authHeader.replace('Bearer ', '');
      console.log('🔑 Middleware got token:', token.substring(0, 20) + '...');
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.error('🔑 Middleware token validation failed:', error);
        return { user: null, isAuthenticated: false };
      }
      
      console.log('🔑 Middleware validated user:', user.email);
      userInfo = user;
    } else {
      console.log('🔑 Middleware got session from cookies:', session.user.email);
      userInfo = session.user;
    }

    if (!userInfo) {
      return { user: null, isAuthenticated: false };
    }

    // Fetch role from user_profiles table (consistent with AuthProvider)
    let userRole = 'user'; // default
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userInfo.id)
        .single();

      if (!profileError && profile?.role) {
        userRole = profile.role;
        console.log('🔑 Middleware fetched role from DB:', userRole, 'for user:', userInfo.email);
      } else {
        console.log('🔑 Middleware could not fetch role from DB:', profileError);
      }
    } catch (profileError) {
      console.error('🔑 Error fetching user profile in middleware:', profileError);
      // Fallback to metadata if database query fails
      userRole = userInfo.user_metadata?.role || 'user';
    }

    return {
      user: {
        id: userInfo.id,
        email: userInfo.email!,
        role: userRole
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