import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSecurityHeaders } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productIds = searchParams.get('product_ids')?.split(',') || [];

    const supabase = createServerClient();

    // If specific product IDs are provided, get sold counts for those products only
    if (productIds.length > 0) {
      const { data: soldCounts, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          orders!inner(status)
        `)
        .in('product_id', productIds)
        .in('orders.status', ['delivered', 'completed', 'processing', 'pending']); // Count delivered, completed, processing, and pending orders

      if (error) {
        console.error('Error fetching sold counts:', error);
        return NextResponse.json(
          { error: 'Failed to fetch sold counts' },
          { status: 500, headers: getSecurityHeaders() }
        );
      }

      // Group by product_id and sum quantities
      const soldCountMap = soldCounts.reduce((acc: Record<string, number>, item: any) => {
        const productId = item.product_id.toString();
        acc[productId] = (acc[productId] || 0) + item.quantity;
        return acc;
      }, {});

      return NextResponse.json(
        { soldCounts: soldCountMap },
        { headers: getSecurityHeaders() }
      );
    }

    // If no specific product IDs, get sold counts for all products
    const { data: allSoldCounts, error: allError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        orders!inner(status)
      `)
      .in('orders.status', ['delivered', 'completed', 'processing', 'pending']); // Count delivered, completed, processing, and pending orders

    if (allError) {
      console.error('Error fetching all sold counts:', allError);
      return NextResponse.json(
        { error: 'Failed to fetch sold counts' },
        { status: 500, headers: getSecurityHeaders() }
      );
    }

    // Group by product_id and sum quantities
    const allSoldCountMap = allSoldCounts.reduce((acc: Record<string, number>, item: any) => {
      const productId = item.product_id.toString();
      acc[productId] = (acc[productId] || 0) + item.quantity;
      return acc;
    }, {});

    return NextResponse.json(
      { soldCounts: allSoldCountMap },
      { headers: getSecurityHeaders() }
    );

  } catch (error) {
    console.error('Error in sold counts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
} 