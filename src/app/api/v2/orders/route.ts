import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CreateOrderSchema, validateRequestBody } from '@/lib/validation/validation';
import { getSecurityHeaders, getClientIP } from '@/lib/rate-limit';
import { 
  securityLogger, 
  logValidationFailed, 
  logOrderCreated,
  logSuspiciousRequest 
} from '@/lib/logger';
import { 
  authenticateRequest, 
  getAuthBasedRateLimit, 
  detectSuspiciousActivity 
} from '@/lib/auth/auth-middleware';
import { 
  createVersionedResponse, 
  DataTransformer 
} from '@/lib/api/api-versioning';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || undefined;
  
  try {
    // Log API access for v2
    securityLogger.logApiAccess(ip, '/api/v2/orders', 'POST', userAgent);
    
    // Authenticate request
    const authContext = await authenticateRequest(request);
    
    // Check for suspicious activity
    const suspiciousReason = detectSuspiciousActivity(request, authContext);
    if (suspiciousReason) {
      logSuspiciousRequest(ip, '/api/v2/orders', suspiciousReason, userAgent);
      return createVersionedResponse(
        { error: 'Request blocked due to suspicious activity' },
        'v2',
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body using Zod schema
    const validation = validateRequestBody(CreateOrderSchema, body);
    
    if (!validation.success) {
      logValidationFailed(ip, '/api/v2/orders', validation.errors || [], userAgent);
      return createVersionedResponse(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        'v2',
        { status: 400 }
      );
    }

    // TypeScript assertion since we know validation.data exists after successful validation
    const validatedData = validation.data!;
    const {
      user_id,
      buyer_info,
      shipping_info,
      payment_method,
      cart_items,
      voucher,
      reward_points,
      total_price,
      shipping_fee
    } = validatedData;

    const supabase = createServerClient();

    // Create shipping address string
    const shipping_address = `${shipping_info.address}, ${shipping_info.ward}, ${shipping_info.district}, ${shipping_info.city}`;

    // Calculate final total
    let voucher_discount = 0;
    let points_discount = 0;

    if (voucher && voucher.discountAmount) {
      voucher_discount = voucher.discountAmount;
    }

    if (reward_points && reward_points > 0) {
      points_discount = reward_points; // Assuming 1 point = 1 VND
    }

    const final_total = Math.max(0, total_price + (shipping_fee || 0) - voucher_discount - points_discount);

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user_id || null, // Allow null for guest orders
        customer_name: buyer_info.fullName,
        customer_phone: buyer_info.phone,
        customer_email: buyer_info.email || null,
        shipping_address,
        shipping_fee: shipping_fee || 0,
        voucher_code: voucher?.code || null,
        voucher_discount,
        points_used: reward_points || 0,
        points_discount,
        payment_method,
        subtotal: total_price,
        total_price: final_total,
        status: 'pending',
        note: shipping_info.note || null
      })
      .select()
      .single();

    if (orderError) {
      securityLogger.logError('Order creation error', new Error(orderError.message), {
        ip,
        userAgent,
        endpoint: '/api/v2/orders'
      });
      return createVersionedResponse(
        { error: `Failed to create order: ${orderError.message}` },
        'v2',
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = cart_items.map((item) => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      variant_id: item.variant?.id || null,
      variant_details: item.variant ? JSON.stringify({
        color: item.variant.color,
        size: item.variant.size,
        gac_chan: item.variant.gac_chan
      }) : null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      product_image: item.image || ''
    }));

    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (orderItemsError) {
      // Try to delete the order if order items creation failed
      await supabase.from('orders').delete().eq('id', orderData.id);
      return createVersionedResponse(
        { error: `Failed to create order items: ${orderItemsError.message}` },
        'v2',
        { status: 500 }
      );
    }

    // Update voucher usage if applicable
    if (voucher && user_id) {
      // Note: voucher.id might not exist from validation schema, need to get from database
      // This is a simplified version - in real app, you'd lookup voucher by code first
      console.log(`Voucher ${voucher.code} used for order ${orderData.id}`);
    }

    // Update user reward points if applicable
    if (user_id) {
      // Deduct used points
      if (reward_points && reward_points > 0) {
        await supabase
          .from('user_rewards')
          .insert({
            user_id,
            order_id: orderData.id,
            points_used: reward_points,
            transaction_type: 'redeem',
            description: `Sử dụng ${reward_points} điểm cho đơn hàng #${orderData.id}`
          });
      }

      // Add earned points (e.g., 1% of total)
      const earned_points = Math.floor(final_total * 0.01);
      if (earned_points > 0) {
        await supabase
          .from('user_rewards')
          .insert({
            user_id,
            order_id: orderData.id,
            points_earned: earned_points,
            transaction_type: 'earn',
            description: `Tích điểm từ đơn hàng #${orderData.id}`
          });
      }
    }

    // Log successful order creation
    logOrderCreated(ip, orderData.id.toString(), authContext.user?.id, userAgent);
    
    // Transform to v2 format
    const orderV2 = DataTransformer.transformOrderV1ToV2({
      ...orderData,
      items: orderItemsData
    });

    return createVersionedResponse({
      success: true,
      order: orderV2,
      metadata: {
        version: 'v2',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - new Date(orderData.created_at).getTime()
      }
    }, 'v2');

  } catch (error) {
    securityLogger.logError('Error creating order', error as Error, {
      ip,
      userAgent,
      endpoint: '/api/v2/orders'
    });
    
    return createVersionedResponse(
      { error: 'Internal server error' },
      'v2',
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ error: 'Failed to fetch user orders' }, { status: 500 });
  }
} 