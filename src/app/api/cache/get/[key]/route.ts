import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    
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