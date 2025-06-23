import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cảm ơn bạn | G3 Tech',
  description: 'Cảm ơn bạn đã đăng ký tài khoản và tin tưởng G3 Tech. Chúng tôi sẽ mang đến những trải nghiệm mua sắm tuyệt vời nhất.',
  robots: 'noindex, nofollow'
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 