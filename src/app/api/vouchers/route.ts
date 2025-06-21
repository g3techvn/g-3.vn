import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSecurityHeaders } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const code = searchParams.get('code');

    const supabase = createServerClient();

    // If looking for a specific voucher by code
    if (code) {
      const { data: voucher, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .gte('valid_to', new Date().toISOString())
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Voucher not found or expired' },
          { status: 404, headers: getSecurityHeaders() }
        );
      }

      return NextResponse.json(
        { voucher },
        { headers: getSecurityHeaders() }
      );
    }

    // Get all active vouchers
    let query = supabase
      .from('vouchers')
      .select('*')
      .eq('is_active', true)
      .gte('valid_to', new Date().toISOString())
      .order('created_at', { ascending: false });

    const { data: vouchers, error } = await query;

    if (error) {
      console.error('Error fetching vouchers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vouchers' },
        { status: 500, headers: getSecurityHeaders() }
      );
    }

    // Filter vouchers based on usage if user_id is provided
    let availableVouchers = vouchers || [];
    
    if (user_id && vouchers) {
      // Check which vouchers this user has already used
      const { data: usedVouchers } = await supabase
        .from('voucher_usages')
        .select('voucher_id, voucher_code, used_at')
        .eq('user_id', user_id);

      const usedVoucherIds = usedVouchers?.map(uv => uv.voucher_id) || [];
      const usedVoucherCodes = usedVouchers?.map(uv => uv.voucher_code) || [];
      
      availableVouchers = vouchers.filter(voucher => {
        // Check global usage limit
        if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
          return false;
        }
        
        // Check if user already used this voucher
        if (usedVoucherIds.includes(voucher.id) || usedVoucherCodes.includes(voucher.code)) {
          return false;
        }
        
        // Check if voucher is still valid
        if (voucher.valid_to && new Date(voucher.valid_to) < new Date()) {
          return false;
        }
        
        // Check if voucher has started
        if (voucher.valid_from && new Date(voucher.valid_from) > new Date()) {
          return false;
        }
        
        return true;
      });
    } else {
      // For guest users, only filter by global limits and validity
      availableVouchers = vouchers.filter(voucher => {
        if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
          return false;
        }
        if (voucher.valid_to && new Date(voucher.valid_to) < new Date()) {
          return false;
        }
        if (voucher.valid_from && new Date(voucher.valid_from) > new Date()) {
          return false;
        }
        return true;
      });
    }

    return NextResponse.json(
      { vouchers: availableVouchers },
      { headers: getSecurityHeaders() }
    );

  } catch (error) {
    console.error('Error in vouchers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
} 