import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

async function GET(request: Request) {
  try {
    const cacheKey = 'brands_list';
    const { cacheData } = await import('@/lib/cache');
    
    // Try to get from cache first
    const cachedData = cacheData.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached brands data');
      return NextResponse.json({ brands: cachedData });
    }

    // If not in cache, query from database
    const supabase = createServerClient();

    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, title, slug, created_at, image_url, image_square_url')
      .eq('status', true) // Only get active brands
      .order('title', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }

    // Cache the result for 5 minutes
    if (brands) {
      cacheData.set(cacheKey, brands, 300); // 5 minutes
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