import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Khởi tạo Supabase client
    const supabase = createServerClient();
    
    // Xây dựng query để lấy dữ liệu từ bảng product_cats
    const query = supabase
      .from('product_cats') // Changed from 'products'
      .select('*');
    
    // Thực hiện query để lấy dữ liệu
    const { data: productCats, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Query successful, returning ${productCats.length} product categories`);
    return NextResponse.json({ product_cats: productCats }); // Changed from 'products'
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in product_cats API:', error); // Updated error message context
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 