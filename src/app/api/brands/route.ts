import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Khởi tạo Supabase client
    const supabase = createServerClient();

    // Lấy danh sách thương hiệu từ bảng brands
    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, title, slug, created_at, image_url, image_square_url');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`Query successful, returning ${brands.length} brands`);
    return NextResponse.json({ brands });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in brands API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 