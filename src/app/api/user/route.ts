import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth/auth-middleware';

// GET /api/user - Get current user profile
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
    
    // Get user profile from user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authContext.user.id)
      .single();

    // If no profile exists, create one with basic info
    if (profileError && profileError.code === 'PGRST116') {
      const newProfile = {
        user_id: authContext.user.id,
        email: authContext.user.email,
        full_name: authContext.user.email.split('@')[0],
        created_at: new Date().toISOString()
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({ profile: createdProfile });
    }

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user - Update user profile
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
    const { full_name, phone, address, date_of_birth, gender } = body;

    const supabase = createServerClient();
    
    // Update user profile in user_profiles table
    const { data: updatedProfile, error: profileError } = await supabase
      .from('user_profiles')
      .update({
        full_name,
        phone,
        address,
        date_of_birth,
        gender,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authContext.user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Update user metadata in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name,
        phone
      }
    });

    if (authError) {
      console.error('Error updating user metadata:', authError);
      // Don't return error since profile was updated successfully
    }

    return NextResponse.json({ profile: updatedProfile });

  } catch (error) {
    console.error('User update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 