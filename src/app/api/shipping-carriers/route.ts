import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSecurityHeaders } from '@/lib/rate-limit';

export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: shippingCarriers, error } = await supabase
      .from('shipping_carriers')
      .select('*')
      .eq('is_active', true)
      .order('estimated_delivery_days');

    if (error) {
      console.error('Error fetching shipping carriers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shipping carriers' },
        { status: 500, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json(
      { shippingCarriers },
      { headers: getSecurityHeaders() }
    );

  } catch (error) {
    console.error('Error in shipping carriers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
} 