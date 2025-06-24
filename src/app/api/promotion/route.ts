import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('API Promotion - Starting fetch');
    const supabase = createServerClient();
    
    if (!supabase) {
      throw new Error('Failed to create Supabase client');
    }
    
    console.log('API Promotion - Querying database');
    const { data: promotions, error } = await supabase
      .from('promotion')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('API Promotion - Supabase error:', error);
      throw error;
    }
    
    console.log(`API Promotion - Found ${promotions?.length || 0} promotions`);
    
    return NextResponse.json(promotions || []);
  } catch (error) {
    console.error('API Promotion - Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      error: 'Failed to fetch promotions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 