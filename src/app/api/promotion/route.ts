import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Khởi tạo Supabase client
    const supabase = createServerClient();
    
    // Truy vấn dữ liệu từ bảng promotion
    const { data: promotions, error } = await supabase
      .from('promotion')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Query successful, returning ${promotions.length} promotions`);
    return NextResponse.json(promotions);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in promotion API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 