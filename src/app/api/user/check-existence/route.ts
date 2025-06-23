import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email hoặc số điện thoại là bắt buộc' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check email in auth.users table
    let emailExists = false;
    if (email) {
      const { data: emailData, error: emailError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (emailData && !emailError) {
        emailExists = true;
      }
    }

    // Check phone in user_profiles table  
    let phoneExists = false;
    if (phone) {
      const { data: phoneData, error: phoneError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('phone', phone)
        .single();

      if (phoneData && !phoneError) {
        phoneExists = true;
      }
    }

    return NextResponse.json({
      emailExists,
      phoneExists,
      message: emailExists || phoneExists 
        ? 'Email hoặc số điện thoại đã tồn tại' 
        : 'Email và số điện thoại có thể sử dụng'
    });

  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống khi kiểm tra thông tin' },
      { status: 500 }
    );
  }
} 