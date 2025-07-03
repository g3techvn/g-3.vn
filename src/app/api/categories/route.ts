import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get domain from environment variable
    const g3Domain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
    
    // Get the sector_id query parameter if provided
    const { searchParams } = new URL(request.url);
    const sector_id = searchParams.get('sector_id');
    
    console.log('API Categories - Using domain:', g3Domain);
    
    // Khởi tạo Supabase client
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
    
    // Fetch product IDs that belong to the sector
    let productIds: string[] = [];
    if (sectorId) {
      const { data: productSectors, error: psError } = await supabase
        .from('product_sectors')
        .select('product_id')
        .eq('sector_id', sectorId);
        
      if (psError) {
        console.error('API Categories - Error fetching product_sectors:', psError);
        return NextResponse.json(
          { error: `Lỗi khi truy vấn product_sectors: ${psError.message}` },
          { status: 500 }
        );
      }
      
      if (productSectors && productSectors.length > 0) {
        productIds = productSectors.map(ps => ps.product_id);
        console.log(`API Categories - Found ${productIds.length} products for sector ID: ${sectorId}`);
      } else {
        console.log(`API Categories - No products found for sector ID: ${sectorId}`);
        return NextResponse.json({ product_cats: [] });
      }
    }
    
    // Get all categories
    const query = supabase.from('product_cats').select('*');
    
    // Execute query to get all categories
    const { data: allProductCats, error } = await query;
    
    if (error) {
      console.error('API Categories - Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }
    
    // If we have product IDs for a sector, filter categories to only include those with products in the sector
    let filteredProductCats = allProductCats;
    if (productIds.length > 0) {
      // Get products that belong to the sector
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('pd_cat_id')
        .in('id', productIds);
        
      if (productsError) {
        console.error('API Categories - Error fetching products:', productsError);
        return NextResponse.json(
          { error: `Lỗi khi truy vấn products: ${productsError.message}` },
          { status: 500 }
        );
      }
      
      if (products && products.length > 0) {
        // Get unique category IDs from products
        const categoryIds = new Set(products.map(p => p.pd_cat_id).filter(Boolean));
        
        // Filter categories to only include those with products in the sector
        filteredProductCats = allProductCats.filter(cat => categoryIds.has(cat.id));
        console.log(`API Categories - Filtered to ${filteredProductCats.length} categories with products in sector`);
      }
    }
    
    console.log(`API Categories - Query successful, returning ${filteredProductCats.length} product categories`);
    return NextResponse.json({ product_cats: filteredProductCats });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Categories - Error in categories API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 