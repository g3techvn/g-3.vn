import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cảm ơn bạn đã đặt hàng | G3 Tech',
  description: 'Đơn hàng của bạn đã được tiếp nhận thành công. Chúng tôi sẽ liên hệ để xác nhận đơn hàng sớm nhất.',
  robots: 'noindex, nofollow'
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 