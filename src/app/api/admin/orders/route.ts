import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServerAdminClient } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

// GET /api/admin/orders - Get all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('📝 Admin orders API called');
    
    // Authenticate user and check admin role
    const authContext = await authenticateRequest(request);
    console.log('📝 Auth context:', {
      isAuthenticated: authContext.isAuthenticated,
      user: authContext.user ? {
        email: authContext.user.email,
        role: authContext.user.role
      } : null
    });
    
    if (!authContext.isAuthenticated || !authContext.user) {
      console.log('📝 Authentication failed');
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
    
    console.log('📝 Admin access granted');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const supabase = createServerAdminClient();

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price,
          total_price,
          product_image
        )
      `)
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Admin orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const body = await request.json();
    const {
      full_name,
      phone,
      email,
      address,
      payment_method,
      status,
      note,
      total_price
    } = body;

    // Validate required fields
    if (!full_name || !phone || !address || !payment_method || !status || total_price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        full_name,
        phone,
        email: email || null,
        address,
        payment_method,
        status,
        note: note || null,
        total_price,
        user_id: null // Admin created orders don't have user_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error('Admin create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 