import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { securityLogger, logSuspiciousRequest } from '@/lib/logger';
import { getClientIP, rateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { 
  PROTECTED_ROUTES, 
  ADMIN_ROUTES, 
  AUTH_CONFIG,
  isProtectedRoute,
  isAdminRoute,
  isApiRoute
} from './auth-constants';

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

/**
 * Standalone authentication function for API routes
 * Returns AuthContext (user, session, isAuthenticated)
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthContext> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    const cacheKey = request.cookies.get('sb-access-token')?.value;
    const now = Date.now();
    let session = null;
    if (cacheKey) {
      const cached = sessionCache.get(cacheKey);
      if (cached && cached.expires > now) {
        session = cached.session;
      } else {
        sessionCache.delete(cacheKey);
      }
    }
    if (!session) {
      try {
        const { data: { session: newSession }, error: sessionError } = await supabase.auth.getSession();
        if (!sessionError && newSession && cacheKey) {
          sessionCache.set(cacheKey, {
            session: newSession,
            expires: now + SESSION_CACHE_TTL
          });
          session = newSession;
        }
      } catch (error) {
        // Ignore session fetch errors for this context
      }
    }
    let user: AuthUser | null = null;
    if (session && session.user) {
      user = {
        id: session.user.id,
        email: session.user.email,
        phone: session.user.phone,
        role: session.user.user_metadata?.role || undefined
      };
    }
    return {
      user,
      session,
      isAuthenticated: !!user
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      isAuthenticated: false
    };
  }
}

// Simple in-memory cache for sessions
const sessionCache = new Map<string, { session: any; expires: number }>();
const SESSION_CACHE_TTL = 60 * 1000; // 1 minute

// Rate limit configurations for different routes
const ROUTE_RATE_LIMITS = {
  '/api/products': RATE_LIMITS.API_GENERAL,
  '/api/orders': RATE_LIMITS.API_GENERAL,
  '/api/categories': RATE_LIMITS.API_GENERAL
};

/**
 * Main authentication handler for middleware
 * Checks authentication and authorization for requests
 */
export async function handleAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    const path = request.nextUrl.pathname;
    console.log('🔐 HandleAuth processing:', path);

    // Check rate limit first
    const clientIP = getClientIP(request);
    const rateLimitKey = `${clientIP}:${path}`;
    const routeLimit = ROUTE_RATE_LIMITS[path as keyof typeof ROUTE_RATE_LIMITS] || RATE_LIMITS.API_GENERAL;
    
    const rateLimitResult = await rateLimit(request, routeLimit);
    if (!rateLimitResult.success) {
      console.log('🚫 Rate limit exceeded for:', rateLimitKey);
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      );
    }

    // Create server client with proper cookie handling
    const cookieStore = await cookies();
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    });

    // Try to get session from cache first
    const cacheKey = request.cookies.get('sb-access-token')?.value;
    const now = Date.now();
    let session = null;
    
    if (cacheKey) {
      const cached = sessionCache.get(cacheKey);
      if (cached && cached.expires > now) {
        session = cached.session;
      } else {
        sessionCache.delete(cacheKey);
      }
    }

    // If not in cache, get from Supabase
    if (!session) {
      try {
        const { data: { session: newSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error in handleAuth:', sessionError);
        } else if (newSession && cacheKey) {
          // Cache the session
          sessionCache.set(cacheKey, {
            session: newSession,
            expires: now + SESSION_CACHE_TTL
          });
          session = newSession;
        }
      } catch (error) {
        const err: any = error;
        if (err.status === 429) {
          console.warn('⚠️ Rate limit hit while getting session, using cached data if available');
        } else {
          console.error('❌ Error getting session:', err);
        }
      }
    }

    // Check if the path requires authentication
    const requiresAuth = isProtectedRoute(path);
    const requiresAdmin = isAdminRoute(path);

    // Check authentication requirements
    if (requiresAuth && !session) {
      console.log('🔒 Auth required but no session found for path:', path);
      if (isApiRoute(path)) {
        return new NextResponse(
          JSON.stringify({ error: AUTH_CONFIG.ERRORS.UNAUTHORIZED }),
          { 
            status: 401, 
            headers: { 
              'Content-Type': 'application/json',
              'WWW-Authenticate': 'Bearer error="invalid_token"'
            } 
          }
        );
      } else {
        // For non-API routes, redirect to login with return URL
        const loginUrl = new URL('/dang-nhap', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
      }
    }

    // If session exists, check admin requirements
    if (session && requiresAdmin) {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('❌ User error in handleAuth:', userError);
          return new NextResponse(
            JSON.stringify({ error: 'Authentication error' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Check admin role requirement
        if (!user || user.user_metadata?.role !== 'admin') {
          console.log('👮‍♂️ Admin required but user is not admin:', user?.email);
          return new NextResponse(
            JSON.stringify({ error: AUTH_CONFIG.ERRORS.FORBIDDEN }),
            { 
              status: 403, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        }
      } catch (error) {
        const err: any = error;
        if (err.status === 429) {
          console.warn('⚠️ Rate limit hit while checking admin status');
          // Allow the request to proceed if we can't verify admin status due to rate limit
          // This is a trade-off between security and availability
        } else {
          console.error('❌ Error checking admin status:', err);
          return new NextResponse(
            JSON.stringify({ error: 'Authentication error' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    console.log('✅ Auth check passed for:', path);
    return null; // Continue to next middleware
    
  } catch (error) {
    const err: any = error;
    console.error('❌ Error in handleAuth:', err);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}