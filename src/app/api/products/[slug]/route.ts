import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    
    // Khởi tạo Supabase client
    const supabase = createServerClient();
    
    // Query sản phẩm theo slug
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        description,
        price,
        original_price,
        image_url,
        cover_image_url,
        gallery_url,
        video_url,
        rating,
        brand_id,
        pd_cat_id,
        feature,
        bestseller,
        status,
        is_featured,
        is_new,
        sold_count,
        thong_so_ky_thuat,
        tinh_nang,
        loi_ich,
        huong_dan,
        comment,
        content,
        created_at,
        updated_at
      `)
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }
    
    if (!product) {
      return NextResponse.json(
        { error: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ product });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in product API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 