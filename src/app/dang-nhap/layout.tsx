import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập | G3 Tech',
  description: 'Đăng nhập vào tài khoản G3 Tech của bạn để quản lý đơn hàng và thông tin cá nhân',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 