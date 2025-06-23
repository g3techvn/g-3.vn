import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

interface SoldCount {
  product_id: string;
  count: number;
}

const soldCountsCache = new Map<string, { data: Record<string, number>; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
  const productIds = searchParams.get('ids')?.split(',') || [];

  if (!productIds.length) {
    return NextResponse.json({ error: 'No product IDs provided' }, { status: 400 });
  }

  const cacheKey = productIds.sort().join(',');
  const cachedData = soldCountsCache.get(cacheKey);

  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData.data);
    }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: soldCounts, error } = await supabase
      .from('sold_counts')
      .select('product_id, count')
      .in('product_id', productIds);

    if (error) {
      throw error;
    }

    const result: Record<string, number> = {};
    soldCounts?.forEach((item: SoldCount) => {
      result[item.product_id] = item.count;
    });

    soldCountsCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching sold counts:', error);
    return NextResponse.json({ error: 'Failed to fetch sold counts' }, { status: 500 });
  }
} 