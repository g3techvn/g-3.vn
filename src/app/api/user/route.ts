import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/user - Get current user profile
export async function GET(request: Request) {
  console.log('🔍 GET /api/user called');
  
  try {
    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }

    if (!session) {
      console.log('❌ No active session found');
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 401 }
      );
    }

    // Get full user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Combine auth user data with profile data
    const userData = {
      id: user.id,
      email: user.email,
      fullName: profile?.full_name || user.user_metadata?.full_name,
      phone: profile?.phone || user.phone,
      role: profile?.role || user.user_metadata?.role || 'user',
      created_at: profile?.created_at || user.created_at,
      profile: profile || null
    };

    console.log('✅ User data fetched successfully');
    return NextResponse.json(userData);

  } catch (error) {
    console.error('❌ Error in /api/user route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user - Update user profile
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT /api/user - Start');
    
    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('❌ Session error:', sessionError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 401 }
      );
    }

    const updateData = await request.json();

    // Map updateData to database fields
    const dbUpdateData = {
      user_id: user.id,
      full_name: updateData.fullName,
      phone: updateData.phone,
      address: updateData.address,
      date_of_birth: updateData.date_of_birth,
      gender: updateData.gender,
      avatar_url: updateData.avatar_url,
      role: updateData.role,
      updated_at: new Date().toISOString()
    };

    // Update user profile
    const { data: profile, error: updateError } = await supabase
      .from('user_profiles')
      .upsert(dbUpdateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Combine profile with auth user data
    const enrichedProfile = {
      id: user.id,
      email: user.email,
      fullName: profile.full_name,
      phone: profile.phone || user.phone,
      address: profile.address,
      date_of_birth: profile.date_of_birth,
      gender: profile.gender,
      avatar_url: profile.avatar_url,
      role: profile.role || 'user',
      created_at: profile.created_at,
      profile: profile
    };

    console.log('✅ Updated profile:', enrichedProfile);
    return NextResponse.json({ profile: enrichedProfile });

  } catch (error) {
    console.error('❌ Error in PUT /api/user:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 