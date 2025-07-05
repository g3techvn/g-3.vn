import { NextRequest, NextResponse } from 'next/server';

const otpStore = globalThis.otpStore || new Map<string, { otp: string, expires: number }>();
if (!globalThis.otpStore) globalThis.otpStore = otpStore;

export async function POST(request: NextRequest) {
  const { email, otp } = await request.json();
  const record = otpStore.get(email);
  if (!record) return NextResponse.json({ error: 'No OTP found' }, { status: 400 });
  if (Date.now() > record.expires) return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
  if (otp !== record.otp) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });

  otpStore.delete(email);
  return NextResponse.json({ success: true });
} 