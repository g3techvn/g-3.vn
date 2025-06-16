import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Product } from '@/types';

interface ProductSectorJoinItem {
  product_id: string;
  products: Product;
}

export async function GET(request: Request) {
  try {
    // Get query parameters from request
    const { searchParams } = new URL(request.url);
    const sectorId = searchParams.get('sector_id');
    
    // Get domain from environment variable
    const g3Domain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
    
    console.log('API Request - Product Sectors:', { g3Domain, sectorId });
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // First, get the appropriate sector based on domain or sector_id
    let sectorQuery = supabase.from('sectors').select('id');
    
    if (sectorId) {
      // If sector_id is provided, use it
      sectorQuery = sectorQuery.eq('id', sectorId);
    } else {
      // Otherwise use the environment variable domain
      sectorQuery = sectorQuery.eq('title', g3Domain);
    }
    
    const { data: sectors, error: sectorError } = await sectorQuery;
    
    if (sectorError) {
      console.error('Supabase sector error:', sectorError);
      return NextResponse.json(
        { error: `Error when querying sectors: ${sectorError.message}` },
        { status: 500 }
      );
    }
    
    if (!sectors || sectors.length === 0) {
      return NextResponse.json(
        { products: [], message: 'No sector found for this domain' }
      );
    }
    
    // Use the first matching sector
    const targetSectorId = sectors[0].id;
    
    // Query products associated with this sector via product_sectors junction table
    const { data: productSectors, error: productSectorError } = await supabase
      .from('product_sectors')
      .select(`
        product_id,
        products:product_id (*)
      `)
      .eq('sector_id', targetSectorId)
      .eq('products.status', true);
    
    if (productSectorError) {
      console.error('Supabase product_sectors error:', productSectorError);
      return NextResponse.json(
        { error: `Error when querying product_sectors: ${productSectorError.message}` },
        { status: 500 }
      );
    }
    
    // Extract products from the joined query result
    const products: Product[] = [];
    
    if (productSectors) {
      for (const item of productSectors) {
        if (item.products && typeof item.products === 'object') {
          // Ensure this is a valid product object
          const product = item.products as unknown as Product;
          if (product.id && product.name) {
            products.push(product);
          }
        }
      }
    }
    
    console.log(`Query successful, returning ${products.length} products for sector ID: ${targetSectorId}`);
    return NextResponse.json({ products, sector_id: targetSectorId });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in product_sectors API:', error);
    return NextResponse.json(
      { error: `An error occurred while processing the request: ${errorMessage}` },
      { status: 500 }
    );
  }
} 