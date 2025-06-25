import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
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
    phone: supabaseUser.user_metadata?.phone,
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
    let mounted = true;

    const checkAuth = async () => {
      try {
        if (!mounted) return;
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Thiết lập listener cho thay đổi auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );
    
    // Chạy kiểm tra lần đầu
    checkAuth();
    
    // Clean up subscription khi unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Hàm đăng nhập
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng ký
  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      // Đăng xuất khỏi session hiện tại nếu có
      await supabase.auth.signOut();

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
          return { error: new Error('Lỗi kết nối mạng khi kiểm tra thông tin') };
        }

        const checkResult = await checkResponse.json();
        
        if (checkResult.emailExists) {
          return { error: new Error('Email này đã được sử dụng. Vui lòng sử dụng email khác.') };
        }
        
        if (checkResult.phoneExists && phone) {
          return { error: new Error('Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.') };
        }
      } catch (checkError) {
        console.error('Error checking user existence:', checkError);
        return { error: new Error('Lỗi kết nối mạng. Vui lòng thử lại.') };
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
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
      
      // Nếu đăng ký thành công và có user, tạo profile trong user_profiles table
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              email: email,
              full_name: fullName,
              phone: phone,
              created_at: new Date().toISOString()
            });
          
          if (profileError) {
            console.error('Error creating user profile:', profileError);
            // Không return error ở đây vì user đã được tạo thành công
          }
        } catch (profileError) {
          console.error('Error inserting user profile:', profileError);
        }
        
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