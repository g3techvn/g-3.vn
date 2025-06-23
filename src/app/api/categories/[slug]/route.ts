import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Lấy slug từ URL
    const url = new URL(request.url);
    const slug = url.pathname.split('/').pop();
    
    console.log('API Category Detail - Getting products for category slug:', slug);
    
    const supabase = createServerClient();
    
    // Query products by category slug
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        product_cats!inner(id, title, slug),
        variants:product_variants(
          id,
          product_id,
          color,
          size,
          weight,
          price,
          original_price,
          image_url,
          gallery_url,
          sku,
          stock_quantity,
          is_default,
          created_at,
          is_dropship,
          gac_chan
        )
      `)
      .eq('product_cats.slug', slug)
      .eq('status', true);

    if (error) {
      console.error('API Category Detail - Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`API Category Detail - Found ${products?.length || 0} products for category ${slug}`);
    return NextResponse.json({ products });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Category Detail - Error in category detail API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 