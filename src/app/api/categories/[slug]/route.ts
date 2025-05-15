import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const supabase = createServerClient();

    // Join products với product_cats, lọc theo slug
    const { data: products, error } = await supabase
      .from('products')
      .select('*, product_cats!inner(id, title, slug)')
      .eq('product_cats.slug', slug);

    if (error) {
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ products });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 