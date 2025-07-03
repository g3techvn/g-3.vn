import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { Product } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const category_id = searchParams.get('category_id');
    const brand_id = searchParams.get('brand_id');
    const sort = searchParams.get('sort');
    const video_only = searchParams.get('video_only') === 'true';
    
    console.log('API Request - Query params:', { page, limit, category_id, brand_id, sort, video_only });
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Build query
    let query = supabase
      .from('products')
      .select('*');
    
    // Add filter conditions
    if (category_id) {
      query = query.eq('pd_cat_id', category_id);
    }
    
    if (brand_id) {
      query = query.eq('brand_id', brand_id);
    }

    // Filter active products only
    query = query.eq('status', true);
    
    // Filter products with video if needed
    if (video_only) {
      query = query
        .not('video_url', 'is', null)
        .neq('video_url', '');
    }
    
    // Add pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Execute query
    const { data: products, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Error querying data: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log('Raw products:', products);
    
    // Validate and convert the fetched products
    const validProducts: Product[] = [];
    if (products && Array.isArray(products)) {
      for (const item of products) {
        if (item && typeof item === 'object' && 'id' in item && 'name' in item) {
          validProducts.push(item as Product);
        }
      }
    }
    
    console.log('Valid products:', validProducts);
    
    // Sort if needed
    if (sort) {
      const [field, order] = sort.split(':');
      if (field && (order === 'asc' || order === 'desc')) {
        validProducts.sort((a, b) => {
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
    }
    
    return NextResponse.json({ products: validProducts });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: `An error occurred while processing the request: ${errorMessage}` },
      { status: 500 }
    );
  }
} 