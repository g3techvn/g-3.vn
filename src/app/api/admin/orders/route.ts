import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

interface OrderData {
  shipping_info: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    cityCode: number;
    district: string;
    districtCode: number;
    ward: string;
    wardCode: number;
  };
  shipping_address_id?: number;
  payment_method_id?: number;
  shipping_carrier_id?: number;
  tracking_number?: string;
  status: string;
  notes?: string;
  total_amount: number;
  items: OrderItem[];
}

// GET /api/admin/orders - Get all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('📝 Admin orders API called at:', new Date().toISOString());
    console.log('📝 Request URL:', request.url);
    console.log('📝 Request headers:', Object.fromEntries(request.headers));
    
    // Authenticate user and check admin role
    const authContext = await authenticateRequest(request);
    console.log('📝 Auth context result:', {
      isAuthenticated: authContext.isAuthenticated,
      user: authContext.user ? {
        id: authContext.user.id,
        email: authContext.user.email,
        role: authContext.user.role
      } : null
    });
    
    if (!authContext.isAuthenticated || !authContext.user) {
      console.log('📝 Authentication failed - returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (authContext.user.role !== 'admin') {
      console.log('📝 Admin access denied for user:', authContext.user.email, 'role:', authContext.user.role);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    console.log('📝 Admin access granted for user:', authContext.user.email);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    console.log('📝 Query parameters:', { page, limit, search, status });

    const supabase = createServerClient();

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items!inner (
          id,
          product_id,
          quantity,
          price,
          total_price,
          products (
            name,
            image_url
          )
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Add filters
    if (search) {
      console.log('📝 Adding search filter:', search);
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status && status !== 'all') {
      console.log('📝 Adding status filter:', status);
      query = query.eq('status', status);
    }

    // Add pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    console.log('📝 Adding pagination:', { start, end });
    query = query.range(start, end);

    console.log('📝 Executing database query...');
    const { data: orders, error, count } = await query;

    console.log('📝 Database query result:', {
      ordersCount: orders?.length || 0,
      totalCount: count,
      hasError: !!error,
      errorMessage: error?.message
    });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const totalPages = count ? Math.ceil(count / limit) : 1;

    const response = {
      orders,
      pagination: {
        page,
        limit,
        total: count,
        pages: totalPages
      }
    };

    console.log('✅ Returning successful response:', {
      ordersCount: orders?.length || 0,
      paginationInfo: response.pagination
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Admin orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/orders - Create new order (admin only)
export async function POST(request: NextRequest) {
  try {
    // Authenticate user and check admin role
    const authContext = await authenticateRequest(request);
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (authContext.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json() as OrderData;
    const {
      shipping_info,
      shipping_address_id,
      payment_method_id,
      shipping_carrier_id,
      tracking_number,
      status,
      notes,
      total_amount,
      items
    } = body;

    // Validate required fields
    if (!shipping_info || !status || total_amount === undefined || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Start a transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: null, // Admin created orders don't have user_id
        status,
        total_amount,
        shipping_address_id,
        payment_method_id,
        shipping_carrier_id,
        tracking_number,
        notes
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      total_price: item.quantity * item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        ...order,
        items: orderItems
      }
    });

  } catch (error) {
    console.error('Error in POST /api/admin/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 