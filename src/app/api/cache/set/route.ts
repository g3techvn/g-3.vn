import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

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
    const body = await request.json();
    const { key, data, expirationInSeconds } = body;
    if (!key || !data) {
      return NextResponse.json(
        { error: 'Key and data are required' },
        { status: 400 }
      );
    }
    await redis.set(key, data, {
      ex: expirationInSeconds || 300 // Default 5 minutes
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cache set error:', error);
    return NextResponse.json(
      { error: 'Failed to set cache data' },
      { status: 500 }
    );
  }
}