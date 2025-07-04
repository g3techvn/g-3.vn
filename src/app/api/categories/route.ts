import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { cacheData } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sector_id = searchParams.get('sector_id');
    
    // Generate cache key
    const cacheKey = `categories_${sector_id || 'all'}`;
    
    // Try to get from cache first
    const cachedData = cacheData.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached categories data');
      return NextResponse.json({ product_cats: cachedData });
    }
    
    // Initialize Supabase client with proper cookie handling
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    });
    
    try {
      // Simplified query to get active categories first
      let query = supabase
        .from('product_cats')
        .select('*')
        .eq('status', true)
        .order('title');

      // Add sector filter if provided
      if (sector_id) {
        query = query.eq('sector_id', sector_id);
      }

      const { data: categories, error: categoriesError } = await query;

      if (categoriesError) {
        console.error('Supabase query error:', categoriesError);
        throw new Error(categoriesError.message || 'Database query failed');
      }
      
      // Cache the results for 5 minutes
      cacheData.set(cacheKey, categories, 300);
      
      return NextResponse.json({ product_cats: categories });
      
    } catch (error) {
      console.error('Error in categories API:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}