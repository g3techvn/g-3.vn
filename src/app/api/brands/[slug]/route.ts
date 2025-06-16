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

    // First get the brand from the slug
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
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
    
    // Then get all products for this brand
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
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
      .eq('brand_id', brand.id)
      .eq('status', true);

    if (productsError) {
      console.error('Supabase error:', productsError);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn sản phẩm: ${productsError.message}` },
        { status: 500 }
      );
    }

    // Return both brand and products data
    return NextResponse.json({ 
      brand,
      products: products || []
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in brand API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 