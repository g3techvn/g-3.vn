import { NextResponse } from 'next/server';

import { rateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export async function POST(request: Request) {
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
    const { cacheData } = await import('@/lib/cache');
    const body = await request.json();
    const { key } = body;
    if (key) {
      cacheData.clear(key);
      return NextResponse.json({ message: `Cache cleared for key: ${key}` });
    } else {
      cacheData.clear();
      return NextResponse.json({ message: 'All cache cleared' });
    }
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}