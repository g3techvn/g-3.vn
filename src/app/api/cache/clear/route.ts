import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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