import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Product, ProductVariant } from '@/types';
import { rateLimit, RATE_LIMITS, getSecurityHeaders, getClientIP } from '@/lib/rate-limit';
import { securityLogger } from '@/lib/logger';

// Simple in-memory cache for products (use Redis in production)
let productsCache: Map<string, {
  data: Product[];
  timestamp: number;
}> = new Map();

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

// Define type for the joined product_sectors query result
interface ProductSectorJoin {
  product_id: string;
  products: Product;
}

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
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

    // Get domain and query parameters from request
    const { searchParams } = new URL(request.url);
    
    // Get domain from searchParams or environment variable
    const domainParam = searchParams.get('domain');
    const g3Domain = domainParam || process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
    
    const category_id = searchParams.get('category_id');
    const brand_id = searchParams.get('brand_id');
    const sort = searchParams.get('sort');
    const sector_id = searchParams.get('sector_id');
    const use_domain = searchParams.get('use_domain') !== 'false'; // Default to true
    
    console.log('API Request - Query params:', { 
      g3Domain, 
      category_id, 
      brand_id, 
      sort, 
      sector_id, 
      use_domain
    });
    
    // Create cache key based on query parameters
    const cacheKey = JSON.stringify({
      g3Domain,
      category_id,
      brand_id,
      sort,
      sector_id,
      use_domain
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
    
    // First, check if we need domain-based filtering
    let products: Product[] = [];

    // Apply domain-based filtering when sector_id is not provided
    if (use_domain && !sector_id) {
      // Get sector ID for this domain
      const { data: sectors, error: sectorError } = await supabase
        .from('sectors')
        .select('id')
        .eq('title', g3Domain)
        .limit(1);
      
      if (sectorError) {
        console.error('Supabase sector error:', sectorError);
        return NextResponse.json(
          { error: `Error querying sectors: ${sectorError.message}` },
          { status: 500 }
        );
      }
      
      if (sectors && sectors.length > 0) {
        const domainSectorId = sectors[0].id;
        
        // Get products associated with this sector
        const { data: productSectors, error: productSectorError } = await supabase
          .from('product_sectors')
          .select(`
            product_id,
            products:product_id (
              *,
              brands:brand_id (
                title
              )
            )
          `)
          .eq('sector_id', domainSectorId)
          .eq('products.status', true);
        
        if (productSectorError) {
          console.error('Supabase product_sectors error:', productSectorError);
          return NextResponse.json(
            { error: `Error querying product_sectors: ${productSectorError.message}` },
            { status: 500 }
          );
        }
        
        // Extract products from the joined query result using a safer approach
        if (productSectors) {
          for (const item of productSectors) {
            if (item.products && typeof item.products === 'object') {
              // Ensure this is a valid product object 
              const product = item.products as unknown as Product & { brands: { title: string } };
              if (product.id && product.name) {
                // Add brand name to product
                products.push({
                  ...product,
                  brand: product.brands?.title
                });
              }
            }
          }
        }
      }
    } else {
      // Regular product query without domain filtering or when sector_id is explicitly provided
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
      
      // If sector_id is provided, get products for that sector
      if (sector_id) {
        // First get product IDs from product_sectors table
        const { data: productSectors, error: productSectorError } = await supabase
          .from('product_sectors')
          .select('product_id')
          .eq('sector_id', sector_id);
        
        if (productSectorError) {
          console.error('Supabase product_sectors error:', productSectorError);
          return NextResponse.json(
            { error: `Error querying product_sectors: ${productSectorError.message}` },
            { status: 500 }
          );
        }
        
        if (productSectors && productSectors.length > 0) {
          const productIds = productSectors.map(item => item.product_id);
          query = query.in('id', productIds);
        } else {
          // If no products in this sector, return empty array
          products = [];
          return NextResponse.json({ products });
        }
      }
      
      // Execute query
      const { data: fetchedProducts, error } = await query;
      
      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: `Error querying data: ${error.message}` },
          { status: 500 }
        );
      }
      
      // Validate and convert the fetched products
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
    }
    
    // Sort results
    const sortedProducts = [...products];
    
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