import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Product } from '@/types';
import { cacheData } from '@/lib/cache';

const DEFAULT_PAGE_SIZE = 50; // Tăng số lượng sản phẩm mặc định
const MAX_PAGE_SIZE = 100; // Giới hạn tối đa

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters with higher defaults
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE)))
    );
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const category_id = searchParams.get('category_id');
    const brand_id = searchParams.get('brand_id');
    const sort = searchParams.get('sort');
    const video_only = searchParams.get('video_only') === 'true';
    
    // Generate cache key based on parameters
    const cacheKey = `products_${page}_${limit}_${category_id || 'all'}_${brand_id || 'all'}_${sort || 'default'}_${video_only}`;
    
    // Try to get from cache first
    const cachedData = cacheData.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached products data');
      return NextResponse.json(cachedData);
    }
    
    // Initialize Supabase client with proper cookie handling
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ 
      cookies: () => cookieStore 
    });
    
    try {
      // Build base query
      let query = supabase
        .from('products')
        .select('*, product_cats(id, title), brands(id, name)', { count: 'exact' })
        .eq('status', true);
      
      // Add filter conditions
      if (category_id) {
        query = query.eq('pd_cat_id', category_id);
      }
      
      if (brand_id) {
        query = query.eq('brand_id', brand_id);
      }
      
      // Filter products with video if needed
      if (video_only) {
        query = query
          .not('video_url', 'is', null)
          .neq('video_url', '');
      }
      
      // Add sorting with proper ordering
      if (sort) {
        const [field, order] = sort.split(':');
        if (field && (order === 'asc' || order === 'desc')) {
          query = query.order(field, { ascending: order === 'asc' });
        }
      } else {
        // Default sorting by created_at desc and then by name
        query = query
          .order('created_at', { ascending: false })
          .order('name', { ascending: true });
      }
      
      // Execute count query first
      const { count, error: countError } = await query;
      
      if (countError) {
        throw new Error(`Failed to get total count: ${countError.message}`);
      }
      
      // Add pagination
      query = query.range(offset, offset + limit - 1);
      
      // Execute main query
      const { data: products, error: productsError } = await query;
      
      if (productsError) {
        throw new Error(`Failed to fetch products: ${productsError.message}`);
      }
      
      // Validate and transform products
      const validProducts = products?.map(product => ({
        ...product,
        category: product.product_cats,
        brand: product.brands,
        // Remove nested objects
        product_cats: undefined,
        brands: undefined
      })).filter(item => 
        item && 
        typeof item === 'object' && 
        'id' in item && 
        'name' in item
      ) || [];
      
      // Prepare response with pagination info
      const response = {
        products: validProducts,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: count ? Math.ceil(count / limit) : 0
        }
      };
      
      // Cache the results for 2 minutes if we have data
      if (validProducts.length > 0) {
        cacheData.set(cacheKey, response, 120);
      }
      
      return NextResponse.json(response);
      
    } catch (queryError) {
      console.error('Query error:', queryError);
      throw new Error(`Database query failed: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`);
    }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in products API:', error);
    return NextResponse.json(
      { 
        error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}`,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}