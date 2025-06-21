import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getSecurityHeaders } from '@/lib/rate-limit';

// POST /api/vouchers/validate - Validate voucher before applying
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { voucher_code, user_id, order_total } = body;

    if (!voucher_code) {
      return NextResponse.json(
        { error: 'Voucher code is required' },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    const supabase = createServerClient();

    // Get voucher details
    const { data: voucher, error: voucherError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', voucher_code)
      .eq('is_active', true)
      .single();

    if (voucherError || !voucher) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Voucher không hợp lệ hoặc không tồn tại' 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Check if voucher is expired
    if (voucher.valid_to && new Date(voucher.valid_to) < new Date()) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Voucher đã hết hạn' 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Check if voucher hasn't started yet
    if (voucher.valid_from && new Date(voucher.valid_from) > new Date()) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Voucher chưa có hiệu lực' 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Check global usage limit
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Voucher đã hết lượt sử dụng' 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Check minimum order value
    if (voucher.min_order_value && order_total < voucher.min_order_value) {
      return NextResponse.json(
        { 
          valid: false, 
          error: `Đơn hàng tối thiểu ${voucher.min_order_value.toLocaleString()}đ để sử dụng voucher này` 
        },
        { status: 400, headers: getSecurityHeaders() }
      );
    }

    // Check if user has already used this voucher (if user_id provided)
    if (user_id) {
      const { data: usage } = await supabase
        .from('voucher_usages')
        .select('id')
        .eq('user_id', user_id)
        .or(`voucher_id.eq.${voucher.id},voucher_code.eq.${voucher_code}`)
        .limit(1);

      if (usage && usage.length > 0) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'Bạn đã sử dụng voucher này rồi' 
          },
          { status: 400, headers: getSecurityHeaders() }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (voucher.discount_type === 'fixed') {
      discountAmount = voucher.discount_amount;
    } else if (voucher.discount_type === 'percentage') {
      discountAmount = Math.floor((order_total * voucher.discount_amount) / 100);
      // Apply max discount if set
      if (voucher.max_discount_amount && discountAmount > voucher.max_discount_amount) {
        discountAmount = voucher.max_discount_amount;
      }
    }

    return NextResponse.json({
      valid: true,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        title: voucher.title,
        description: voucher.description,
        discountAmount: discountAmount,
        discountType: voucher.discount_type,
        minOrderValue: voucher.min_order_value || 0,
        expiryDate: voucher.valid_to
      },
      message: `Áp dụng thành công! Giảm ${discountAmount.toLocaleString()}đ`
    }, { headers: getSecurityHeaders() });

  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Có lỗi xảy ra khi kiểm tra voucher' 
      },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
} 