'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { isProtectedRoute } from '@/lib/auth/auth-constants';

interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  checkAuth: async () => {}
});

// Routes that require authentication


// Export the AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const cleanup = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    // Initial auth check
    checkAuth();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    // Re-run auth check on route change for protected routes
    if (pathname && isProtectedRoute(pathname)) {
      checkAuth();
    }
  }, [pathname]);

  const checkAuth = async () => {
    const startTime = Date.now();
    console.log('🔍 Starting auth check...', new Date().toISOString());
    
    // Create new AbortController
    cleanup(); // Cleanup any existing controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setLoading(true);
      setError(null);

      // Global timeout for entire auth check process
      const globalTimeout = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort('Auth check timeout');
        }
      }, 15000); // 15 second timeout for entire process

      // Step 1: Create Supabase client
      console.log('📍 Step 1: Creating Supabase client...');
      const supabase = createBrowserClient();
      if (!supabase) {
        console.error('❌ Failed to create Supabase client');
        setError('Failed to initialize authentication');
        setUser(null);
        return;
      }
      console.log('✅ Step 1 completed - Supabase client created');

      // Step 2: Try immediate session check first (synchronous if cached)
      console.log('📍 Step 2: Quick session check...');
      let session, sessionError;
      
      try {
        // First try a quick session check
        const quickResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Quick check timeout')), 3000))
        ]) as { data: { session: any }, error: any };
        
        session = quickResult.data.session;
        sessionError = quickResult.error;
        
        if (session) {
          console.log('✅ Step 2 completed - Quick session check successful');
          
          // Step 3: Get user data
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (user && !userError) {
            setUser({
              id: user.id,
              email: user.email || '',
              fullName: user.user_metadata?.full_name,
              role: user.user_metadata?.role,
              phone: user.phone || '',
              created_at: user.created_at
            });
            setError(null);
          } else {
            console.error('❌ Failed to get user data:', userError);
            setUser(null);
            setError('Failed to get user data');
          }
        } else {
          throw new Error('No session found');
        }
      } catch (quickError) {
        console.log('⚠️ Step 2 failed - Quick session check failed, trying with timeout:', quickError);
        
        if (signal.aborted) {
          throw new Error('Auth check aborted during quick check');
        }

        // If quick check fails, try with longer timeout
        try {
          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 8000)
          );

          const result = await Promise.race([sessionPromise, timeoutPromise]);
          const sessionResult = result as { data: { session: any }, error: any };
          session = sessionResult.data.session;
          sessionError = sessionResult.error;

          if (session) {
            console.log('✅ Step 2 completed - Timeout-protected session check successful');
            
            // Step 3: Get user data
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (user && !userError) {
              setUser({
                id: user.id,
                email: user.email || '',
                fullName: user.user_metadata?.full_name,
                role: user.user_metadata?.role,
                phone: user.phone || '',
                created_at: user.created_at
              });
              setError(null);
            } else {
              console.error('❌ Failed to get user data:', userError);
              setUser(null);
              setError('Failed to get user data');
            }
          } else {
            throw new Error('No session found');
          }
        } catch (error) {
          if (signal.aborted) {
            throw new Error('Auth check aborted during extended check');
          }

          console.log('⏰ Step 2 timed out:', error);
          
          const timeoutError = error as Error;
          if (timeoutError.message === 'Session check timeout') {
            setError('Connection timeout - please check your internet connection');
            setLoading(false);
            return;
          }

          // Step 2b: Try localStorage fallback
          console.log('📍 Step 2b: Checking localStorage fallback...');
          try {
            if (signal.aborted) {
              throw new Error('Auth check aborted during localStorage check');
            }

            // Try multiple possible localStorage keys
            const possibleKeys = [
              'supabase.auth.token',
              'sb-jjraznkvgfsgqrqvlcwo-auth-token',
              'supabase-auth-token'
            ];
            
            let storedSession = null;
            for (const key of possibleKeys) {
              storedSession = localStorage.getItem(key);
              if (storedSession) {
                console.log(`📍 Found auth data in localStorage key: ${key}`);
                break;
              }
            }
            
            if (storedSession) {
              const parsed = JSON.parse(storedSession);
              if (parsed.access_token) {
                console.log('🔄 Using stored session token...');
                const { data: { user }, error } = await supabase.auth.getUser(parsed.access_token);
                if (user && !error) {
                  setUser({
                    id: user.id,
                    email: user.email || '',
                    fullName: user.user_metadata?.full_name,
                    role: user.user_metadata?.role,
                    phone: user.phone || '',
                    created_at: user.created_at
                  });
                  setError(null);
                  console.log('✅ Step 2b completed - Fallback session successful');
                } else {
                  throw new Error('Invalid stored session');
                }
              }
            } else {
              setUser(null);
              setError('No valid session found');
            }
          } catch (fallbackError) {
            console.log('❌ Step 2b failed:', fallbackError);
            if (fallbackError instanceof Error && fallbackError.message.includes('aborted')) {
              throw fallbackError;
            }
            setUser(null);
            setError('Failed to restore session');
          }
        }
      }

      // Clear global timeout as we've completed the critical parts
      clearTimeout(globalTimeout);

      // Step 4: Handle protected routes
      console.log('📍 Step 4: Checking route protection...');
      const isProtected = pathname ? isProtectedRoute(pathname) : false;
      if (isProtected && !user) {
        console.log('🔒 Protected route accessed without auth, redirecting...');
        router.push('/dang-nhap');
      }

      console.log('✅ Auth check completed in', Date.now() - startTime, 'ms');
      setLoading(false);

    } catch (error) {
      console.error('❌ Auth check error:', error);
      if (error instanceof Error) {
        if (error.message.includes('aborted')) {
          // If aborted, try to get session synchronously from localStorage
          try {
            const storedSession = localStorage.getItem('sb-jjraznkvgfsgqrqvlcwo-auth-token');
            if (storedSession) {
              const parsed = JSON.parse(storedSession);
              if (parsed.user) {
                const user = parsed.user;
                setUser({
                  id: user.id,
                  email: user.email || '',
                  fullName: user.user_metadata?.full_name,
                  role: user.user_metadata?.role,
                  phone: user.phone || '',
                  created_at: user.created_at
                });
                setError(null);
                console.log('✅ Recovered session from localStorage after abort');
              }
            }
          } catch (fallbackError) {
            console.error('❌ Failed to recover from abort:', fallbackError);
            setError('Authentication check failed. Please refresh the page.');
          }
        } else {
          setError(error.message);
        }
      } else {
        setError('An unknown error occurred');
      }
      setUser(null);
      setLoading(false);
    } finally {
      cleanup();
    }
  };

  // Subscribe to auth state changes
  useEffect(() => {
    const supabase = createBrowserClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name,
            role: session.user.user_metadata?.role,
            phone: session.user.phone || '',
            created_at: session.user.created_at
          });
          setError(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Hàm đăng nhập với retry mechanism
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createBrowserClient();
      if (!supabase) {
        throw new Error('Failed to initialize authentication client');
      }

      // Try sign in with timeout protection
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign in timeout')), 8000)
      );

      const { data, error: signInError } = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as any;

      if (signInError) {
        console.error('❌ Sign in error:', signInError);
        return { error: new Error(signInError.message) };
      }
      
      if (data?.user) {
        const basicUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          role: data.user.id === process.env.ADMIN_USER_ID ? 'admin' : 'user'
        };
        setUser(basicUser);
        await checkAuth(); // Fetch full profile after sign in
      }
      
      return { error: null };
    } catch (err) {
      console.error('❌ Sign in failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng ký
  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      // Đăng xuất khỏi session hiện tại nếu có
      await createBrowserClient().auth.signOut();

      // Kiểm tra email và phone đã tồn tại chưa trước khi đăng ký
      try {
        const checkResponse = await fetch('/api/user/check-existence', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, phone }),
        });

        if (!checkResponse.ok) {
          const errorData = await checkResponse.json();
          return { error: new Error(errorData.message || 'Email hoặc số điện thoại đã tồn tại') };
        }
      } catch (checkError) {
        console.error('Error checking existence:', checkError);
      }

      // Tiến hành đăng ký
      const { data, error: signUpError } = await createBrowserClient().auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });

      if (signUpError) {
        return { error: new Error(signUpError.message) };
      }

      if (data.user) {
        const basicUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          fullName,
          phone,
          role: 'user'
        };
        setUser(basicUser);
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  // Hàm đăng xuất
  const signOut = async () => {
    try {
      const { error: signOutError } = await createBrowserClient().auth.signOut();
      
      if (signOutError) {
        return { error: new Error(signOutError.message) };
      }
      
      setUser(null);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  // Hàm reset mật khẩu
  const resetPassword = async (email: string) => {
    try {
      const { error: resetError } = await createBrowserClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (resetError) {
        return { error: new Error(resetError.message) };
      }
      
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};