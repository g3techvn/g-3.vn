import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Product } from '@/types';
import { cacheData } from '@/lib/cache';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

import { rateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limit public API
  const ip = getClientIP(request);
  const rateLimitResult = await rateLimit(request, RATE_LIMITS.PUBLIC);
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    // ... phần còn lại giữ nguyên như cũ ...
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE)))
    );
    const offset = (page - 1) * limit;
    const category_id = searchParams.get('category_id');
    const brand_id = searchParams.get('brand_id');
    const sort = searchParams.get('sort');
    const video_only = searchParams.get('video_only') === 'true';
    const type = searchParams.get('type');
    const cacheKey = `products_${page}_${limit}_${category_id || 'all'}_${brand_id || 'all'}_${sort || 'default'}_${video_only}_${type || 'all'}`;
    const cachedData = cacheData.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached products data');
      return NextResponse.json(cachedData);
    }
    const supabase = createServerClient();
    try {
      let query = supabase
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
          updated_at,
          product_cats!inner (
            id,
            title
          ),
          brands!inner (
            id,
            title
          )
        `, { count: 'exact' })
        .eq('status', true);
      if (category_id) {
        query = query.eq('pd_cat_id', category_id);
      }
      if (brand_id) {
        query = query.eq('brand_id', brand_id);
      }
      if (type === 'new') {
        query = query.order('created_at', { ascending: false }).limit(8);
      } else if (type === 'mobilefeature') {
        query = query.eq('feature', true);
      }
      if (video_only) {
        query = query
          .not('video_url', 'is', null)
          .neq('video_url', '');
      }
      if (sort) {
        const [field, order] = sort.split(':');
        if (field && (order === 'asc' || order === 'desc')) {
          query = query.order(field, { ascending: order === 'asc' });
        }
      } else if (!type) {
        query = query
          .order('created_at', { ascending: false })
          .order('name', { ascending: true });
      }
      if (!type || (type !== 'new' && type !== 'mobilefeature')) {
        query = query.range(offset, offset + limit - 1);
      }
      const { data: products, count, error: queryError } = await query;
      if (queryError) {
        console.error('Database query error:', queryError);
        throw new Error(`Failed to fetch products: ${queryError.message}`);
      }
      const validProducts = products?.map(product => ({
        ...product,
        category: product.product_cats,
        brand: product.brands,
        product_cats: undefined,
        brands: undefined
      })).filter(item =>
        item &&
        typeof item === 'object' &&
        'id' in item &&
        'name' in item
      ) || [];
      const response = {
        products: validProducts,
        pagination: !type || (type !== 'new' && type !== 'mobilefeature') ? {
          page,
          limit,
          total: count || 0,
          total_pages: count ? Math.ceil(count / limit) : 0
        } : undefined
      };
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