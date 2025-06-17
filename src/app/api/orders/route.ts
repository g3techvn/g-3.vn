import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CartItem } from '@/types/cart';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      user_id,
      buyer_info,
      shipping_info,
      payment_method,
      cart_items,
      voucher,
      reward_points,
      total_price,
      shipping_fee = 0
    } = body;

    // Validate required fields
    if (!buyer_info?.fullName || !buyer_info?.phone || !shipping_info?.address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!cart_items || cart_items.length === 0) {
      return NextResponse.json(
        { error: 'Cart items cannot be empty' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Create shipping address string
    const shipping_address = `${shipping_info.address}, ${shipping_info.ward}, ${shipping_info.district}, ${shipping_info.city}`;

    // Calculate final total
    let voucher_discount = 0;
    let points_discount = 0;

    if (voucher && voucher.discountAmount) {
      voucher_discount = voucher.discountAmount;
    }

    if (reward_points > 0) {
      points_discount = reward_points; // Assuming 1 point = 1 VND
    }

    const final_total = Math.max(0, total_price + shipping_fee - voucher_discount - points_discount);

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user_id || null, // Allow null for guest orders
        customer_name: buyer_info.fullName,
        customer_phone: buyer_info.phone,
        customer_email: buyer_info.email || null,
        shipping_address,
        shipping_fee,
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
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: `Failed to create order: ${orderError.message}` },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = cart_items.map((item: CartItem) => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      variant_id: item.variant?.id || null,
      variant_details: item.variant ? JSON.stringify({
        color: item.variant.color,
        size: item.variant.size,
        weight: item.variant.weight
      }) : null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      product_image: item.image
    }));

    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (orderItemsError) {
      console.error('Order items creation error:', orderItemsError);
      // Try to delete the order if order items creation failed
      await supabase.from('orders').delete().eq('id', orderData.id);
      return NextResponse.json(
        { error: `Failed to create order items: ${orderItemsError.message}` },
        { status: 500 }
      );
    }

    // Update voucher usage if applicable
    if (voucher && user_id) {
      await supabase
        .from('voucher_usages')
        .insert({
          user_id,
          voucher_id: voucher.id,
          order_id: orderData.id,
          discount_amount: voucher_discount
        });
    }

    // Update user reward points if applicable
    if (user_id) {
      // Deduct used points
      if (reward_points > 0) {
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

    return NextResponse.json({
      success: true,
      order: {
        ...orderData,
        items: orderItemsData
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch orders: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 