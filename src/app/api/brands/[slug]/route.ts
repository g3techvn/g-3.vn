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

    // First get the brand ID from the slug
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', slug)
      .single();

    if (brandError) {
      console.error('Supabase error:', brandError);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn thương hiệu: ${brandError.message}` },
        { status: 500 }
      );
    }

    if (!brand) {
      return NextResponse.json(
        { error: 'Không tìm thấy thương hiệu' },
        { status: 404 }
      );
    }
    
    // Query tất cả sản phẩm theo brand_id
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        brands:brand_id (
          id,
          title,
          slug,
          image_url,
          image_square_url
        )
      `)
      .eq('brand_id', brand.id);
    
    if (productsError) {
      console.error('Supabase error:', productsError);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn sản phẩm: ${productsError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ products });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in products by brand API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 