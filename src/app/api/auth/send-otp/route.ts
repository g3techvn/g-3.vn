import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Simple in-memory OTP store (replace with Redis for production)
const otpStore = globalThis.otpStore || new Map<string, { otp: string, expires: number }>();
if (!globalThis.otpStore) globalThis.otpStore = otpStore;

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  // Sinh OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 phút
  otpStore.set(email, { otp, expires });

  // Gửi email (cấu hình transporter phù hợp)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your G3.vn Admin OTP Code',
    text: `Your OTP code is: ${otp} (valid for 5 minutes)`
  });

  return NextResponse.json({ success: true });
} 