import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSecurityHeaders } from '@/lib/rate-limit';

import { rateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limit public API
  const ip = getClientIP(request);
  const rateLimitResult = await rateLimit(request, RATE_LIMITS.PUBLIC);
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }
  try {
    const supabase = createServerClient();
    const { data: shippingCarriers, error } = await supabase
      .from('shipping_carriers')
      .select('*')
      .eq('is_active', true);
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