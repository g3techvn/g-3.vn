import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSecurityHeaders } from '@/lib/rate-limit';

import { rateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export async function GET() {
  // Rate limit public API
  const ip = getClientIP();
  const rateLimitResult = await rateLimit({ headers: new Headers() }, RATE_LIMITS.PUBLIC);
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
    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) {
      console.error('Error fetching payment methods:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment methods' },
        { status: 500, headers: getSecurityHeaders() }
      );
    }
    return NextResponse.json(
      { paymentMethods },
      { headers: getSecurityHeaders() }
    );
  } catch (error) {
    console.error('Error in payment methods API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
} 