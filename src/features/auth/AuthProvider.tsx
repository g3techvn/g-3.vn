import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Chuyển đổi từ Supabase User sang User của chúng ta
const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    fullName: supabaseUser.user_metadata?.full_name || 'Người dùng',
    avatar: supabaseUser.user_metadata?.avatar_url,
    role: supabaseUser.app_metadata?.role || 'user',
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createBrowserClient();

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Lấy session hiện tại từ Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Chạy kiểm tra lần đầu
    checkAuth();
    
    // Thiết lập listener cho thay đổi auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    
    // Clean up subscription khi unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Hàm đăng nhập
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        return { error: new Error(signInError.message) };
      }
      
      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
      
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  // Hàm đăng ký
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (signUpError) {
        return { error: new Error(signUpError.message) };
      }
      
      // Trong Supabase, người dùng có thể cần xác nhận email trước khi hoàn tất đăng ký
      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
      
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  // Hàm đăng xuất
  const signOut = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
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

  // Value cho context
  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 