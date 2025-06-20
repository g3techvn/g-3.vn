import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

// GET /api/user/addresses - Get user's shipping addresses
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authContext = await authenticateRequest(request);
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    
    const { data: addresses, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('user_id', authContext.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shipping addresses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ addresses });

  } catch (error) {
    console.error('Addresses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/user/addresses - Create new shipping address
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authContext = await authenticateRequest(request);
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      full_name,
      phone,
      address_line_1,
      address_line_2,
      city,
      district,
      ward,
      postal_code,
      is_default = false
    } = body;

    // Validate required fields
    if (!full_name || !phone || !address_line_1 || !city || !district) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    
    // If this is set as default, unset other default addresses
    if (is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', authContext.user.id);
    }

    const newAddress = {
      user_id: authContext.user.id,
      full_name,
      phone,
      address_line_1,
      address_line_2,
      city,
      district,
      ward,
      postal_code,
      is_default,
      created_at: new Date().toISOString()
    };

    const { data: address, error } = await supabase
      .from('shipping_addresses')
      .insert(newAddress)
      .select()
      .single();

    if (error) {
      console.error('Error creating shipping address:', error);
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ address });

  } catch (error) {
    console.error('Create address API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user/addresses - Update shipping address
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authContext = await authenticateRequest(request);
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, is_default, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    
    // If this is set as default, unset other default addresses
    if (is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', authContext.user.id);
    }

    const { data: address, error } = await supabase
      .from('shipping_addresses')
      .update({
        ...updateData,
        is_default,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', authContext.user.id) // Security: only update own addresses
      .select()
      .single();

    if (error) {
      console.error('Error updating shipping address:', error);
      return NextResponse.json(
        { error: 'Failed to update address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ address });

  } catch (error) {
    console.error('Update address API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 