import React from 'react';
import { Metadata } from 'next';
import ThankYouRegistrationClient from './ThankYouRegistrationClient';

export const metadata: Metadata = {
  title: 'Đăng ký thành công | G3 Tech',
  description: 'Chào mừng bạn đến với cộng đồng G3 Tech! Tài khoản của bạn đã được tạo thành công.',
  robots: 'noindex, nofollow'
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ThankYouRegistrationPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const email = typeof params.email === 'string' ? params.email : undefined;
  return <ThankYouRegistrationClient email={email} />;
} 