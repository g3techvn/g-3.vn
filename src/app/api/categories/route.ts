import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Simple in-memory cache for categories (use Redis in production)
let categoriesCache: {
  data: any[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Check cache first
    const now = Date.now();
    if (categoriesCache.data && (now - categoriesCache.timestamp) < CACHE_DURATION) {
      console.log('API Categories - Returning cached data');
      return NextResponse.json({ product_cats: categoriesCache.data });
    }
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      throw error;
      }
      
    // Filter categories that have products and add product count
    const categoriesWithProducts = categories
      ?.map(cat => ({
          ...cat,
        product_count: cat.products?.length || 0
        }))
        .filter(cat => cat.product_count > 0)
        .sort((a, b) => b.product_count - a.product_count);
      
    console.log(`API Categories - Found ${categoriesWithProducts?.length || 0} categories with products`);
      
      // Cache the result
      categoriesCache = { 
      data: categoriesWithProducts || [], 
      timestamp: now
      };
      
    return NextResponse.json({ product_cats: categoriesWithProducts || [] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Categories - Error in categories API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 