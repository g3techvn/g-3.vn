import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
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
  try {
    // Check cache first
    const now = Date.now();
    if (categoriesCache.data && (now - categoriesCache.timestamp) < CACHE_DURATION) {
      console.log('API Categories - Returning cached data');
      return NextResponse.json({ product_cats: categoriesCache.data });
    }

    // Create Supabase client using the server client helper
    const supabase = createServerClient();
    
    console.log('API Categories - Fetching categories from Supabase');
    const { data: categories, error } = await supabase
      .from('product_cats')
      .select(`
        id,
        title,
        slug,
        description,
        image_url,
        image_square_url,
        products (
          id
        )
      `)
      .order('title');

    if (error) {
      console.error('API Categories - Supabase error:', error);
      throw error;
    }

    if (!categories) {
      console.error('API Categories - No categories data returned');
      throw new Error('No categories data returned from database');
    }
      
    // Filter categories that have products and add product count
    const categoriesWithProducts = categories
      .map(cat => ({
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
        description: cat.description,
        image_url: cat.image_url,
        image_square_url: cat.image_square_url,
        product_count: cat.products?.length || 0
      }))
      .filter(cat => cat.product_count > 0)
      .sort((a, b) => b.product_count - a.product_count);
      
    console.log(`API Categories - Found ${categoriesWithProducts.length} categories with products`);
      
    // Cache the result
    categoriesCache = { 
      data: categoriesWithProducts, 
      timestamp: now
    };
      
    return NextResponse.json({ product_cats: categoriesWithProducts });
  } catch (error: unknown) {
    console.error('API Categories - Detailed error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 