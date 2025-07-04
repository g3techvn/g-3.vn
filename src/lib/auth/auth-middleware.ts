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

// Rate limit configurations for different routes
const ROUTE_RATE_LIMITS = {
  '/api/products': RATE_LIMITS.API_GENERAL,
  '/api/orders': RATE_LIMITS.API_GENERAL
};

/**
 * Main authentication handler for middleware
 * Checks authentication and authorization for requests
 */
export async function handleAuth(request: NextRequest): Promise<NextResponse | null> {
  try {
    console.log('🔐 HandleAuth processing:', request.nextUrl.pathname);

    // Create server client with proper cookie handling
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    });

    // Get session and user data
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error in handleAuth:', sessionError);
    }

    // Check if the path requires authentication
    const path = request.nextUrl.pathname;
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
    }

    console.log('✅ Auth check passed for:', path);
    return null; // Continue to next middleware
    
  } catch (error) {
    console.error('❌ Error in handleAuth:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Function for API routes to authenticate requests
 * Returns AuthContext with user info or throws error
 */
export async function authenticateRequest(request: Request): Promise<AuthContext> {
  console.log('🔍 Starting authenticateRequest for:', request.url);
  
  try {
    // Create server client with proper cookie handling
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    });

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
    const requiresAuth = isProtectedRoute(path);
    
    if (requiresAuth) {
      console.log('🔒 Auth required but failed for path:', path);
      const response = NextResponse.json(
        { error: AUTH_CONFIG.ERRORS.UNAUTHORIZED },
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

// Rest of the code remains unchanged...