import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSecurityHeaders } from '@/lib/rate-limit';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

import { rateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limit public API
  const ip = getClientIP(request);
  const rateLimitResult = await rateLimit(request, RATE_LIMITS.PUBLIC);
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const code = searchParams.get('code');
    const supabase = createServerClient();
    // ... giữ nguyên logic cũ ...
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
      // Transform voucher data to match new format
      const transformedVoucher = transformVoucherData(voucher);
      return NextResponse.json(
        { voucher: transformedVoucher },
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
    if (user_id) {
      query.eq('user_id', user_id);
    }
    const { data: vouchers, error } = await query;
    if (error) {
      console.error('Error fetching vouchers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vouchers' },
        { status: 500, headers: getSecurityHeaders() }
      );
    }
    // Filter and transform vouchers
    let availableVouchers = vouchers || [];
    if (user_id && vouchers) {
      // Check which vouchers this user has already used
      const { data: usedVouchers } = await supabase
        .from('voucher_usages')
        .select('voucher_id, voucher_code, used_at')
        .eq('user_id', user_id);
      const usedVoucherIds = usedVouchers?.map(uv => uv.voucher_id) || [];
      const usedVoucherCodes = usedVouchers?.map(uv => uv.voucher_code) || [];
      availableVouchers = vouchers
        .filter(voucher => {
          if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
            return false;
          }
          if (usedVoucherIds.includes(voucher.id) || usedVoucherCodes.includes(voucher.code)) {
            return false;
          }
          if (voucher.valid_to && new Date(voucher.valid_to) < new Date()) {
            return false;
          }
          if (voucher.valid_from && new Date(voucher.valid_from) > new Date()) {
            return false;
          }
          return true;
        })
        .map(transformVoucherData); // Transform each voucher
    } else {
      // For guest users, only filter by global limits and validity
      availableVouchers = vouchers
        .filter(voucher => {
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
        })
        .map(transformVoucherData); // Transform each voucher
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

// Helper function to transform voucher data
function transformVoucherData(voucher: any) {
  return {
    ...voucher,
    // Convert legacy discount_amount to discount_value if needed
    discount_value: voucher.discount_value || voucher.discount_amount,
    // Set proper discount_type
    discount_type: voucher.is_freeship ? 'shipping' 
      : voucher.is_installation ? 'service'
      : voucher.discount_type,
    // Add new fields
    is_freeship: !!voucher.is_freeship,
    is_installation: !!voucher.is_installation,
    location_provinces: voucher.location_provinces || []
  };
} 