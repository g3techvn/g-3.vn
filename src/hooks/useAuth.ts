import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Kiểu dữ liệu cho người dùng
interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: string;
}

// Kiểu dữ liệu đăng nhập/đăng ký
interface AuthCredentials {
  email: string;
  password: string;
}

interface SignUpData extends AuthCredentials {
  fullName: string;
}

// Hàm mock để lấy thông tin người dùng từ localStorage
const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

// Hàm mock để lưu thông tin người dùng vào localStorage
const saveUser = (user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

// Hook kiểm tra trạng thái đăng nhập
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      // Kiểm tra localStorage thay vì gọi Supabase
      const user = getUser();
      
      if (!user) {
        return null;
      }
      
      // Trong môi trường thực tế, bạn có thể gọi API để xác thực token
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

// Hook đăng nhập
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      // Mock đăng nhập - trong thực tế sẽ gọi API
      if (credentials.email === 'demo@g-3.vn' && credentials.password === 'password') {
        const userData: User = {
          id: '1',
          email: credentials.email,
          fullName: 'Người dùng demo',
          role: 'user'
        };
        saveUser(userData);
        return { user: userData };
      }
      throw new Error('Email hoặc mật khẩu không đúng');
    },
    onSuccess: async () => {
      // Sau khi đăng nhập thành công, cập nhật thông tin người dùng
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

// Hook đăng ký
export function useSignUp() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (signUpData: SignUpData) => {
      // Mock đăng ký - trong thực tế sẽ gọi API
      const userData: User = {
        id: Date.now().toString(),
        email: signUpData.email,
        fullName: signUpData.fullName,
        role: 'user'
      };
      saveUser(userData);
      return { user: userData };
    },
    onSuccess: async () => {
      // Sau khi đăng ký thành công, cập nhật thông tin người dùng
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

// Hook đăng xuất
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Xóa thông tin người dùng khỏi localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      return true;
    },
    onSuccess: async () => {
      // Xóa dữ liệu người dùng khỏi cache
      queryClient.setQueryData(['currentUser'], null);
      // Xóa các dữ liệu cá nhân khỏi cache
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// Hook cập nhật thông tin người dùng
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      // Mock cập nhật profile - trong thực tế sẽ gọi API
      const currentUser = getUser();
      if (!currentUser) throw new Error('Người dùng chưa đăng nhập');
      
      const updatedUser = { ...currentUser, ...userData };
      saveUser(updatedUser);
      return updatedUser;
    },
    onSuccess: async () => {
      // Cập nhật thông tin người dùng trong cache
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}

// Hook reset mật khẩu
export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      // Mock reset password - trong thực tế sẽ gọi API
      console.log(`Đã gửi email reset password đến ${email}`);
      return true;
    },
  });
} 