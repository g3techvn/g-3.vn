import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Simple in-memory cache for categories (use Redis in production)
let categoriesCache: {
  data: any[] | null;
  timestamp: number;
  sectorId: string | null;
} = {
  data: null,
  timestamp: 0,
  sectorId: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  try {
    // Get domain from environment variable
    const g3Domain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
    
    // Get the sector_id query parameter if provided
    const { searchParams } = new URL(request.url);
    const sector_id = searchParams.get('sector_id');
    
    console.log('API Categories - Using domain:', g3Domain);
    
    // Check cache first
    const now = Date.now();
    const cacheKey = sector_id || g3Domain;
    if (categoriesCache.data && 
        categoriesCache.sectorId === cacheKey &&
        (now - categoriesCache.timestamp) < CACHE_DURATION) {
      console.log('API Categories - Returning cached data');
      return NextResponse.json({ product_cats: categoriesCache.data });
    }
    
    const supabase = createServerClient();
    
    // Get sector ID for this domain if not directly provided
    let sectorId = sector_id;
    if (!sectorId) {
      const { data: sectors, error: sectorError } = await supabase
        .from('sectors')
        .select('id')
        .eq('title', g3Domain)
        .limit(1);
        
      if (sectorError) {
        console.error('API Categories - Supabase sector error:', sectorError);
        return NextResponse.json(
          { error: `Lỗi khi truy vấn sectors: ${sectorError.message}` },
          { status: 500 }
        );
      }
      
      if (sectors && sectors.length > 0) {
        sectorId = sectors[0].id;
      }
    }
    
    if (!sectorId) {
      console.log('API Categories - No sector found for domain');
      return NextResponse.json({ product_cats: [] });
    }

    // Optimized single query using joins to get categories with product counts
    const { data: categoryData, error } = await supabase
      .rpc('get_categories_with_product_count', {
        input_sector_id: sectorId
      });

    if (error) {
      console.log('API Categories - RPC not available, falling back to manual query');
      
      // Fallback to optimized manual query
      const { data: productSectors, error: psError } = await supabase
        .from('product_sectors')
        .select(`
          product_id,
          products!inner (
            id,
            pd_cat_id,
            status
          )
        `)
        .eq('sector_id', sectorId)
        .eq('products.status', true);
        
      if (psError) {
        console.error('API Categories - Error fetching product_sectors:', psError);
        return NextResponse.json(
          { error: `Lỗi khi truy vấn product_sectors: ${psError.message}` },
          { status: 500 }
        );
      }
      
      if (!productSectors || productSectors.length === 0) {
        console.log('API Categories - No products found for sector');
        categoriesCache = { data: [], timestamp: now, sectorId: cacheKey };
        return NextResponse.json({ product_cats: [] });
      }
      
      // Count products per category
      const categoryProductCounts = new Map<string, number>();
      productSectors.forEach(item => {
        if (item.products && typeof item.products === 'object' && 'pd_cat_id' in item.products) {
          const product = item.products as any;
          const catId = product.pd_cat_id;
          if (catId) {
            categoryProductCounts.set(catId, (categoryProductCounts.get(catId) || 0) + 1);
          }
        }
      });
      
      // Get categories that have products
      const categoryIds = Array.from(categoryProductCounts.keys());
      if (categoryIds.length === 0) {
        categoriesCache = { data: [], timestamp: now, sectorId: cacheKey };
        return NextResponse.json({ product_cats: [] });
      }
      
      const { data: categories, error: catError } = await supabase
        .from('product_cats')
        .select('*')
        .in('id', categoryIds);
        
      if (catError) {
        console.error('API Categories - Error fetching categories:', catError);
        return NextResponse.json(
          { error: `Lỗi khi truy vấn categories: ${catError.message}` },
          { status: 500 }
        );
      }
      
      // Add product counts to categories and sort by count
      const categoriesWithCounts = (categories || [])
        .map(cat => ({
          ...cat,
          product_count: categoryProductCounts.get(cat.id) || 0
        }))
        .filter(cat => cat.product_count > 0)
        .sort((a, b) => b.product_count - a.product_count);
      
      console.log(`API Categories - Found ${categoriesWithCounts.length} categories with products`);
      
      // Cache the result
      categoriesCache = { 
        data: categoriesWithCounts, 
        timestamp: now, 
        sectorId: cacheKey 
      };
      
      return NextResponse.json({ product_cats: categoriesWithCounts });
    }
    
    // If RPC worked, use that data
    console.log(`API Categories - RPC returned ${categoryData?.length || 0} categories`);
    categoriesCache = { data: categoryData || [], timestamp: now, sectorId: cacheKey };
    return NextResponse.json({ product_cats: categoryData || [] });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Categories - Error in categories API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 