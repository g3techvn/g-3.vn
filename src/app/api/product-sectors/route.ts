import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Product } from '@/types';

interface ProductSectorJoinItem {
  product_id: string;
  products: Product;
}

export async function GET(request: Request) {
  try {
    // Get domain and query parameters from request
    const { headers, url } = request;
    const { searchParams } = new URL(url);
    const host = headers.get('host') || '';
    const domain = host.split(':')[0]; // Remove port if present
    const sectorId = searchParams.get('sector_id');
    
    console.log('API Request - Product Sectors:', { domain, sectorId });
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // First, get the appropriate sector based on domain
    let sectorQuery = supabase.from('sectors').select('id');
    
    if (sectorId) {
      // If sector_id is provided, use it
      sectorQuery = sectorQuery.eq('id', sectorId);
    } else if (domain) {
      // Otherwise use domain as filter
      sectorQuery = sectorQuery.eq('title', domain);
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
      .eq('sector_id', targetSectorId);
    
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