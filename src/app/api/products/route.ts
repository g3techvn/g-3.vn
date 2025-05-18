import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Product } from '@/types';

// Define type for the joined product_sectors query result
interface ProductSectorJoin {
  product_id: string;
  products: Product;
}

export async function GET(request: Request) {
  try {
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
            products:product_id (*)
          `)
          .eq('sector_id', domainSectorId);
        
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
              const product = item.products as unknown as Product;
              if (product.id && product.name) {
                products.push(product);
              }
            }
          }
        }
      }
    } else {
      // Regular product query without domain filtering or when sector_id is explicitly provided
      let query = supabase.from('products').select('*');
      
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
            products.push(item as Product);
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
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }
    } else {
      // Default sort by creation time
      sortedProducts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    
    console.log(`Query successful, returning ${sortedProducts.length} products`);
    return NextResponse.json({ products: sortedProducts });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: `An error occurred while processing the request: ${errorMessage}` },
      { status: 500 }
    );
  }
} 