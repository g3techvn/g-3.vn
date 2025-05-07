import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
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

// Hàm mock để tạo và lưu thông tin người dùng vào localStorage
const saveUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Hàm mock để lấy thông tin người dùng từ localStorage
const getUser = (): User | null => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        setLoading(true);
        const userData = getUser();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Hàm đăng nhập
  const signIn = async (email: string, password: string) => {
    try {
      // Mock xác thực - trong thực tế sẽ gọi API
      if (email === 'demo@g-3.vn' && password === 'password') {
        const userData: User = {
          id: '1',
          email: email,
          fullName: 'Người dùng demo',
          role: 'user'
        };
        saveUser(userData);
        setUser(userData);
        return { error: null };
      }
      return { error: new Error('Email hoặc mật khẩu không đúng') };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  // Hàm đăng ký
  const signUp = async (email: string, password: string) => {
    try {
      // Mock đăng ký - trong thực tế sẽ gọi API
      // Trong ứng dụng thực tế, password sẽ được mã hóa và lưu trữ an toàn
      const userData: User = {
        id: Date.now().toString(),
        email,
        fullName: 'Người dùng mới',
        role: 'user'
      };
      
      // Lưu mật khẩu vào localStorage chỉ để demo (không nên làm điều này trong thực tế)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`password_${email}`, password);
      }
      
      saveUser(userData);
      setUser(userData);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  // Hàm đăng xuất
  const signOut = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  // Hàm reset mật khẩu
  const resetPassword = async (email: string) => {
    try {
      // Mock reset password - trong thực tế sẽ gọi API
      console.log(`Đã gửi email reset password đến ${email}`);
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