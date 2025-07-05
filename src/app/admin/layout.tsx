import { ReactNode, useState } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import AdminOTPForm from '@/components/features/auth/AdminOTPForm';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, otpRequired, otpVerified, setOtpVerified } = useAuth();

  if (user?.role === 'admin' && otpRequired && !otpVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AdminOTPForm email={user.email} onVerified={() => setOtpVerified(true)} />
      </div>
    );
  }

  // Nếu đã xác thực OTP, render dashboard admin
  return <>{children}</>;
} 