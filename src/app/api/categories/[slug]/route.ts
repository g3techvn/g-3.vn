import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get domain from environment variable
    const g3Domain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
    
    // Lấy slug từ URL
    const url = new URL(request.url);
    const slug = url.pathname.split('/').pop();
    
    // Get the sector_id query parameter if provided
    const sector_id = url.searchParams.get('sector_id');
    
    console.log('API Category Detail - Using domain:', g3Domain, 'slug:', slug);
    
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
        console.error('API Category Detail - Supabase sector error:', sectorError);
        return NextResponse.json(
          { error: `Lỗi khi truy vấn sectors: ${sectorError.message}` },
          { status: 500 }
        );
      }
      
      if (sectors && sectors.length > 0) {
        sectorId = sectors[0].id;
      }
    }
    
    let query = supabase
      .from('products')
      .select(`
        *,
        product_cats!inner(id, title, slug),
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
      .eq('product_cats.slug', slug)
      .eq('status', true);
    
    // If we have a sector ID, apply the filtering
    if (sectorId) {
      // First get product IDs from product_sectors table
      const { data: productSectors, error: productSectorError } = await supabase
        .from('product_sectors')
        .select('product_id')
        .eq('sector_id', sectorId);
      
      if (productSectorError) {
        console.error('API Category Detail - Supabase product_sectors error:', productSectorError);
        return NextResponse.json(
          { error: `Lỗi khi truy vấn product_sectors: ${productSectorError.message}` },
          { status: 500 }
        );
      }
      
      if (productSectors && productSectors.length > 0) {
        const productIds = productSectors.map(item => item.product_id);
        console.log(`API Category Detail - Found ${productIds.length} products for sector ${sectorId}`);
        query = query.in('id', productIds);
      } else {
        // If no products in this sector, return empty array
        console.log(`API Category Detail - No products found for sector ${sectorId}`);
        return NextResponse.json({ products: [] });
      }
    }
    
    // Execute the query
    const { data: products, error } = await query;

    if (error) {
      console.error('API Category Detail - Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`API Category Detail - Found ${products?.length || 0} products for category ${slug}`);
    return NextResponse.json({ products });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Category Detail - Error in category detail API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 