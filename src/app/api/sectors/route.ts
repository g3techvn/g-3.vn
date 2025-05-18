import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get domain from request parameters
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    
    // Get domain from environment variable if title is not provided
    const g3Domain = title || process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
    
    console.log('API Request - Sectors for domain:', g3Domain);
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Query to get sectors
    let query = supabase.from('sectors').select('*');
    
    // Filter sectors by title matching the domain
    if (g3Domain) {
      query = query.eq('title', g3Domain);
    }
    
    // Execute query to get data
    const { data: sectors, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Error when querying data: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Query successful, returning ${sectors?.length || 0} sectors`);
    return NextResponse.json({ sectors });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in sectors API:', error);
    return NextResponse.json(
      { error: `An error occurred while processing the request: ${errorMessage}` },
      { status: 500 }
    );
  }
} 