import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get domain from request headers
    const { headers } = request;
    const host = headers.get('host') || '';
    const domain = host.split(':')[0]; // Remove port if present
    
    console.log('API Request - Sectors for domain:', domain);
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Query to get sectors
    let query = supabase.from('sectors').select('*');
    
    // If domain is provided, filter sectors by title matching domain
    if (domain) {
      query = query.eq('title', domain);
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
    
    console.log(`Query successful, returning ${sectors.length} sectors`);
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