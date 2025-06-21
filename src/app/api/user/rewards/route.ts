import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth/auth-middleware';
import { getSecurityHeaders } from '@/lib/rate-limit';

// GET /api/user/rewards - Get user's reward points and transaction history
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authContext = await authenticateRequest(request);
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Calculate user's total reward points from transaction history
    const { data: transactions } = await supabase
      .from('reward_transactions')
      .select('type, points')
      .eq('user_id', authContext.user.id);

    let totalEarned = 0;
    let totalUsed = 0;
    let pointsBalance = 0;

    if (transactions) {
      transactions.forEach((t) => {
        if (t.type === 'earn') {
          totalEarned += t.points;
        } else if (t.type === 'redeem') {
          totalUsed += t.points;
        }
      });
      pointsBalance = totalEarned - totalUsed;
    }

    // Get transaction history with pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: transactionHistory, error: transError } = await supabase
      .from('reward_transactions')
      .select('*')
      .eq('user_id', authContext.user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (transError) {
      console.error('Error fetching reward transactions:', transError);
      return NextResponse.json(
        { error: 'Failed to fetch reward data' },
        { status: 500, headers: getSecurityHeaders() }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('reward_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authContext.user.id);

    return NextResponse.json({
      points: {
        available: pointsBalance,
        total: totalEarned,
        pointValue: 1000, // 1 điểm = 1000 VND
        minPointsToRedeem: 100,
        maxPointsPerOrder: Math.min(pointsBalance, 10000) // Tối đa 10,000 điểm/đơn
      },
      transactions: transactionHistory || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('User rewards API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
}

// POST /api/user/rewards - Add reward points (admin only or system)
export async function POST(request: NextRequest) {
  try {
    const authContext = await authenticateRequest(request);
    if (!authContext.isAuthenticated || !authContext.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: getSecurityHeaders() }
      );
    }

    const body = await request.json();
    const { points, type, reason, related_order_id } = body;

    // Validate input
    if (!type || !reason) {
      return NextResponse.json(
        { error: 'Transaction type and reason are required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    if (!points || points <= 0) {
      return NextResponse.json(
        { error: 'Points must be greater than 0' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    if (type !== 'earn' && type !== 'redeem') {
      return NextResponse.json(
        { error: 'Transaction type must be "earn" or "redeem"' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const supabase = createServerClient();

    // Check current balance for redemption
    if (type === 'redeem') {
      // Calculate current balance from all transactions
      const { data: allTransactions } = await supabase
        .from('reward_transactions')
        .select('type, points')
        .eq('user_id', authContext.user.id);

      let currentBalance = 0;
      if (allTransactions) {
        allTransactions.forEach((t) => {
          if (t.type === 'earn') {
            currentBalance += t.points;
          } else if (t.type === 'redeem') {
            currentBalance -= t.points;
          }
        });
      }

      if (points > currentBalance) {
        return NextResponse.json(
          { error: 'Insufficient reward points' },
          { status: 400, headers: getSecurityHeaders() }
        );
      }
    }

    // Insert reward transaction
    const { data: transaction, error: insertError } = await supabase
      .from('reward_transactions')
      .insert({
        user_id: authContext.user.id,
        type,
        points,
        reason,
        related_order_id: related_order_id || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting reward transaction:', insertError);
      return NextResponse.json(
        { error: 'Failed to process reward transaction' },
        { status: 500, headers: getSecurityHeaders() }
      );
    }

    return NextResponse.json({
      success: true,
      transaction
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Error processing reward transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
} 