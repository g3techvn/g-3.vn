import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSecurityHeaders } from '@/lib/rate-limit';

// Cache for sold counts (can be longer since it's auto-updated via triggers)
let soldCountsCache: Map<string, { data: Record<string, number>; timestamp: number }> = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes since we have auto-updating triggers

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIds = searchParams.get('product_ids')?.split(',') || [];

    // Create cache key
    const cacheKey = productIds.length > 0 ? productIds.sort().join(',') : 'all';
    const now = Date.now();
    
    // Check cache first
    const cached = soldCountsCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(
        { soldCounts: cached.data },
        { headers: getSecurityHeaders() }
      );
    }

    const supabase = createServerClient();

    // Optimized query - just select sold_count from products
    if (productIds.length > 0) {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, sold_count')
        .in('id', productIds)
        .eq('status', true);

      if (error) {
        console.error('Error fetching sold counts:', error);
        return NextResponse.json(
          { error: 'Failed to fetch sold counts' },
          { status: 500, headers: getSecurityHeaders() }
        );
      }

      // Convert to sold count map
      const soldCountMap = products.reduce((acc: Record<string, number>, product: any) => {
        acc[product.id.toString()] = product.sold_count || 0;
        return acc;
      }, {});

      // Cache the result
      soldCountsCache.set(cacheKey, {
        data: soldCountMap,
        timestamp: now
      });

      return NextResponse.json(
        { soldCounts: soldCountMap },
        { headers: getSecurityHeaders() }
      );
    }

    // Get sold counts for all products (with pagination for large datasets)
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, sold_count')
      .eq('status', true)
      .order('sold_count', { ascending: false })
      .limit(1000); // Limit to prevent memory issues

    if (allError) {
      console.error('Error fetching all sold counts:', allError);
      return NextResponse.json(
        { error: 'Failed to fetch sold counts' },
        { status: 500, headers: getSecurityHeaders() }
      );
    }

    // Convert to sold count map
    const allSoldCountMap = allProducts.reduce((acc: Record<string, number>, product: any) => {
      acc[product.id.toString()] = product.sold_count || 0;
      return acc;
    }, {});

    // Cache the result
    soldCountsCache.set(cacheKey, {
      data: allSoldCountMap,
      timestamp: now
    });

    // Clean old cache entries (keep only last 50 entries)
    if (soldCountsCache.size > 50) {
      const entries = Array.from(soldCountsCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      soldCountsCache.clear();
      entries.slice(0, 25).forEach(([key, value]) => {
        soldCountsCache.set(key, value);
      });
    }

    return NextResponse.json(
      { soldCounts: allSoldCountMap },
      { headers: getSecurityHeaders() }
    );

  } catch (error) {
    console.error('Error in optimized sold counts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// POST endpoint to manually trigger sold count update for specific products
export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'productIds array is required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const supabase = createServerClient();

    // Call the stored procedure to update sold counts
    const updatePromises = productIds.map(async (productId: string) => {
      const { data, error } = await supabase.rpc('update_product_sold_count', {
        product_id_param: parseInt(productId, 10) // Convert to BIGINT
      });

      if (error) {
        console.error(`Error updating sold count for product ${productId}:`, error);
        return { productId, error: error.message };
      }

      return { productId, newSoldCount: data };
    });

    const results = await Promise.all(updatePromises);

    // Clear cache for affected products
    soldCountsCache.clear();

    return NextResponse.json(
      { 
        message: 'Sold counts updated',
        results 
      },
      { headers: getSecurityHeaders() }
    );

  } catch (error) {
    console.error('Error in POST sold counts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
} 