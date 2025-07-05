import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

import { rateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  context: { params: { key: string } }
) {
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
    const { key } = context.params;
    if (!key) {
      return NextResponse.json(
        { error: 'Cache key is required' },
        { status: 400 }
      );
    }
    const data = await redis.get(key);
    if (!data) {
      return NextResponse.json(
        { error: 'Cache miss' },
        { status: 404 }
      );
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Cache get error:', error);
    return NextResponse.json(
      { error: 'Failed to get cached data' },
      { status: 500 }
    );
  }
}