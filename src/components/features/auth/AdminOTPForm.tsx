"use client";

import React, { useState, useEffect } from 'react';

interface AdminOTPFormProps {
  email: string;
  onVerified: () => void;
}

const AdminOTPForm: React.FC<AdminOTPFormProps> = ({ email, onVerified }) => {
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Gửi OTP khi mount
  useEffect(() => {
    sendOTP();
    // eslint-disable-next-line
  }, []);

  // Đếm ngược gửi lại mã
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const sendOTP = async () => {
    setStatus('sending');
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('sent');
        setResendTimer(60); // 60s mới cho gửi lại
      } else {
        setStatus('error');
        setError(data.error || 'Gửi mã OTP thất bại');
      }
    } catch (err) {
      setStatus('error');
      setError('Gửi mã OTP thất bại');
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('verifying');
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
        onVerified();
      } else {
        setStatus('error');
        setError(data.error || 'Mã OTP không đúng hoặc đã hết hạn');
      }
    } catch (err) {
      setStatus('error');
      setError('Xác thực OTP thất bại');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2 text-center">Xác thực 2 lớp (2FA) cho Admin</h2>
      <p className="mb-4 text-center text-gray-600">Mã OTP đã được gửi tới email <b>{email}</b>. Vui lòng nhập mã gồm 6 số để tiếp tục.</p>
      <form onSubmit={verifyOTP} className="flex flex-col gap-3">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          minLength={6}
          className="border rounded px-3 py-2 text-center text-lg tracking-widest"
          placeholder="Nhập mã OTP 6 số"
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          disabled={status === 'verifying' || status === 'success'}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-60"
          disabled={otp.length !== 6 || status === 'verifying' || status === 'success'}
        >
          {status === 'verifying' ? 'Đang xác thực...' : 'Xác nhận OTP'}
        </button>
      </form>
      <div className="flex justify-between items-center mt-3">
        <button
          className="text-blue-600 hover:underline text-sm"
          onClick={sendOTP}
          disabled={resendTimer > 0 || status === 'sending'}
        >
          {resendTimer > 0 ? `Gửi lại mã sau ${resendTimer}s` : 'Gửi lại mã OTP'}
        </button>
        {status === 'sent' && <span className="text-green-600 text-xs">Đã gửi mã!</span>}
      </div>
      {error && <div className="text-red-600 mt-2 text-center text-sm">{error}</div>}
      {status === 'success' && <div className="text-green-600 mt-2 text-center font-semibold">Xác thực thành công!</div>}
    </div>
  );
};

export default AdminOTPForm; 