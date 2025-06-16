import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  context: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await context.params;
    
    // Khởi tạo Supabase client
    const supabase = createServerClient();
    
    // Query brand theo ID
    const { data: brand, error } = await supabase
      .from('brands')
      .select('id, title, slug, created_at, image_url, image_square_url')
      .eq('id', brandId)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }
    
    if (!brand) {
      return NextResponse.json(
        { error: 'Không tìm thấy thương hiệu' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ brand });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in brand by ID API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 