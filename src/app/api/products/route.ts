import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Product, ProductVariant } from '@/types';
import { rateLimit, RATE_LIMITS, getSecurityHeaders, getClientIP } from '@/lib/rate-limit';
import { securityLogger } from '@/lib/logger';

// Simple in-memory cache for products (use Redis in production)
const productsCache = new Map();

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Debug: Check environment variables
    console.log('🔍 Environment check:', {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
    });

    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.PUBLIC);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429, 
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Log API access
    securityLogger.logApiAccess(ip, '/api/products', 'GET');

    // Get query parameters from request
    const { searchParams } = new URL(request.url);
    
    const category_id = searchParams.get('category_id');
    const brand_id = searchParams.get('brand_id');
    const sort = searchParams.get('sort');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    
    console.log('API Request - Query params:', { 
      category_id, 
      brand_id, 
      sort, 
      type,
      limit,
      page
    });
    
    // Create cache key based on query parameters
    const cacheKey = JSON.stringify({
      category_id,
      brand_id,
      sort,
      type,
      limit,
      page
    });
    
    // Check cache first
    const now = Date.now();
    const cached = productsCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('API Products - Returning cached data');
      return NextResponse.json(
        { products: cached.data },
        { headers: getSecurityHeaders() }
      );
    }
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
      let query = supabase.from('products')
        .select(`
          *,
          brands:brand_id (
            title
          ),
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
        .eq('status', true);
      
      // Add filter conditions
      if (category_id) {
        query = query.eq('pd_cat_id', category_id);
      }
      
      if (brand_id) {
        query = query.eq('brand_id', brand_id);
      }
      
      if (type === 'combo') {
        query = query.eq('feature', true)
                    .eq('brand_id', 1)
                    .eq('pd_cat_id', 1)
                    .limit(8);
      }
      
      if (type === 'mobilefeature') {
        // Mobile feature products - show diverse brands without restrictions
        query = query.eq('feature', true)
                    .limit(25); // More products for mobile feature display
      }
      
      // Apply pagination if both page and limit are provided
      if (page && limit) {
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);
      } else if (limit && !type) {
        // Apply limit only if no type specified (avoid overriding type-specific limits)
        query = query.limit(limit);
      }
      
      // Execute query
      const { data: fetchedProducts, error } = await query;
      
      if (error) {
        console.error('Supabase error:', error);
        securityLogger.logError('Supabase products error', error as Error, {
          ip,
          endpoint: '/api/products'
        });
        return NextResponse.json(
          { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
          { status: 500, headers: getSecurityHeaders() }
        );
      }
      
      if (!fetchedProducts) {
        console.error('No products data returned');
        return NextResponse.json(
          { error: 'Không tìm thấy dữ liệu sản phẩm' },
          { status: 404, headers: getSecurityHeaders() }
        );
      }
      
      // Validate and convert the fetched products
    let products: Product[] = [];
      if (fetchedProducts && Array.isArray(fetchedProducts)) {
        for (const item of fetchedProducts) {
          if (item && typeof item === 'object' && 'id' in item && 'name' in item) {
            // Add brand name and variants to product
            products.push({
              ...item,
              brand: (item as Product & { brands?: { title: string } }).brands?.title,
              variants: (item as Product & { variants: ProductVariant[] }).variants || []
            });
        }
      }
    }
    
    // Sort results
    let sortedProducts = [...products];
    
    if (sort) {
      const [field, order] = sort.split(':');
      if (field && (order === 'asc' || order === 'desc')) {
        sortedProducts.sort((a, b) => {
          const aValue = a[field as keyof Product];
          const bValue = b[field as keyof Product];
          
          if (aValue === undefined || bValue === undefined) {
            return 0;
          }
          
          if (order === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
      }
    } else {
      // Default sort by creation time
      sortedProducts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      sortedProducts = sortedProducts.slice(0, limit);
    }
    
    // Cache the result
    productsCache.set(cacheKey, {
      data: sortedProducts,
      timestamp: now
    });
    
    // Clean old cache entries (keep only last 100 entries)
    if (productsCache.size > 100) {
      const entries = Array.from(productsCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      productsCache.clear();
      entries.slice(0, 50).forEach(([key, value]) => {
        productsCache.set(key, value);
      });
    }
    
    // Secure logging - don't log sensitive parameters
    securityLogger.logApiAccess(ip, '/api/products', 'GET', undefined);
    
    return NextResponse.json(
      { products: sortedProducts },
      { headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    securityLogger.logError('Error in products API', error as Error, {
      ip,
      endpoint: '/api/products'
    });
    
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
} 