import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { CartItem } from '@/types/cart';
import { CreateOrderSchema, validateRequestBody } from '@/lib/validation/validation';
import { rateLimit, RATE_LIMITS, getSecurityHeaders, getClientIP } from '@/lib/rate-limit';
import { 
  securityLogger, 
  logRateLimitExceeded, 
  logValidationFailed, 
  logOrderCreated,
  logSuspiciousRequest 
} from '@/lib/logger';
import { 
  authenticateRequest, 
  getAuthBasedRateLimit, 
  detectSuspiciousActivity 
} from '@/lib/auth/auth-middleware';
import { generateOrderToken } from '@/lib/order-tokens';
import { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || undefined;
  
  try {
    // Log API access
    securityLogger.logApiAccess(ip, '/api/orders', 'POST', userAgent);
    
    // Authenticate request
    const authContext = await authenticateRequest(request);
    
    // Check for suspicious activity
    const suspiciousReason = detectSuspiciousActivity(request, authContext);
    if (suspiciousReason) {
      logSuspiciousRequest(ip, '/api/orders', suspiciousReason, userAgent);
      return NextResponse.json(
        { error: 'Request blocked due to suspicious activity' },
        { status: 403, headers: getSecurityHeaders() }
      );
    }
    
    // Apply auth-based rate limiting
    const rateConfig = getAuthBasedRateLimit(authContext);
    const rateLimitResult = await rateLimit(request, rateConfig);
    
    if (!rateLimitResult.success) {
      logRateLimitExceeded(ip, '/api/orders', userAgent);
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            ...getSecurityHeaders(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    const body = await request.json();
    
    // Validate request body using Zod schema
    const validation = validateRequestBody(CreateOrderSchema, body);
    
    if (!validation.success) {
      logValidationFailed(ip, '/api/orders', validation.errors || [], userAgent);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors 
        },
        { status: 400, headers: getSecurityHeaders() }
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

    // Create order using service role client to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user_id || null, // Allow null for guest orders
        full_name: buyer_info.fullName, // Match database schema
        phone: buyer_info.phone,
        email: buyer_info.email || null,
        address: shipping_address,
        note: shipping_info.note || null,
        total_price: final_total,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = cart_items.map((item) => ({
      order_id: orderData.id,
      product_id: typeof item.id === 'string' ? parseInt(item.id) : item.id, // Convert to number for database
      product_name: item.name,
      quantity: item.quantity,
      price: item.price, // Match database schema
      total_price: item.price * item.quantity,
      product_image: item.image || ''
    }));

    const { data: orderItemsData, error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)
      .select();

    if (orderItemsError) {
      console.error('Order items creation error:', orderItemsError);
      // Try to delete the order if order items creation failed
      await supabaseAdmin.from('orders').delete().eq('id', orderData.id);
      return NextResponse.json(
        { error: `Failed to create order items: ${orderItemsError.message}` },
        { status: 500 }
      );
    }

    // Update voucher usage if applicable
    if (voucher && voucher.code) {
      try {
        // First, get the voucher from database to get its ID
        const { data: voucherData, error: voucherError } = await supabase
          .from('vouchers')
          .select('id')
          .eq('code', voucher.code)
          .single();

        if (voucherData && !voucherError) {
          // Update voucher used count
          const { data: currentVoucher } = await supabase
            .from('vouchers')
            .select('used_count')
            .eq('id', voucherData.id)
            .single();

          await supabase
            .from('vouchers')
            .update({ used_count: (currentVoucher?.used_count || 0) + 1 })
            .eq('id', voucherData.id);

          // Record voucher usage if user is logged in
          if (user_id) {
            await supabase
              .from('voucher_usages')
              .insert({
                voucher_id: voucherData.id,
                user_id,
                order_id: orderData.id,
                discount_amount: voucher_discount
              });
          }
        }
      } catch (error) {
        console.error('Error updating voucher usage:', error);
      }
    }

    // Update user reward points if applicable
    if (user_id) {
      try {
        // Calculate current user points balance from transactions
        const { data: allTransactions } = await supabase
          .from('reward_transactions')
          .select('type, points')
          .eq('user_id', user_id);

        let availablePoints = 0;
        if (allTransactions) {
          allTransactions.forEach((t) => {
            if (t.type === 'earn') {
              availablePoints += t.points;
            } else if (t.type === 'redeem') {
              availablePoints -= t.points;
            }
          });
        }

        // Deduct used points
        if (reward_points && reward_points > 0) {
          if (reward_points > availablePoints) {
            console.error('Insufficient reward points');
            // Could throw error or just proceed without using points
          } else {
            await supabase
              .from('reward_transactions')
              .insert({
                user_id,
                type: 'redeem',
                points: reward_points,
                reason: `Sử dụng ${reward_points} điểm cho đơn hàng #${orderData.id}`,
                related_order_id: orderData.id
              });
          }
        }

        // Add earned points (1 point per 1000 VND spent)
        const earned_points = Math.floor(final_total / 1000);
        if (earned_points > 0) {
          await supabase
            .from('reward_transactions')
            .insert({
              user_id,
              type: 'earn',
              points: earned_points,
              reason: `Tích điểm từ đơn hàng #${orderData.id} (${final_total.toLocaleString()}đ)`,
              related_order_id: orderData.id
            });
        }
      } catch (error) {
        console.error('Error updating reward points:', error);
        // Continue with order creation even if reward points fail
      }
    }

    // Generate secure access token for thank you page
    const accessToken = generateOrderToken(String(orderData.id));

    // Log successful order creation
    logOrderCreated(ip, String(orderData.id), authContext.user?.id || undefined, userAgent);
    
    return NextResponse.json({
      success: true,
      order: {
        ...orderData,
        items: orderItemsData,
        accessToken // Include token for secure access
      }
    }, {
      headers: getSecurityHeaders()
    });

  } catch (error) {
    securityLogger.logError('Error creating order', error as Error, {
      ip,
      userAgent,
      endpoint: '/api/orders'
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

export async function GET() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
} 