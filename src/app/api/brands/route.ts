import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { rateLimit, RATE_LIMITS, getSecurityHeaders, getClientIP } from '@/lib/rate-limit';
import { securityLogger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.PUBLIC);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429, 
          headers: {
            ...getSecurityHeaders(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Log API access
    securityLogger.logApiAccess(ip, '/api/brands', 'GET');

    // Khởi tạo Supabase client
    const supabase = createServerClient();

    // Lấy danh sách thương hiệu từ bảng brands
    const { data: brands, error } = await supabase
      .from('brands')
      .select('id, title, slug, created_at, image_url, image_square_url');

    if (error) {
      securityLogger.logError('Supabase brands error', error as Error, {
        ip,
        endpoint: '/api/brands'
      });
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500, headers: getSecurityHeaders() }
      );
    }

    console.log(`Query successful, returning ${brands.length} brands`);
    return NextResponse.json(
      { brands },
      { headers: getSecurityHeaders() }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    securityLogger.logError('Error in brands API', error as Error, {
      ip,
      endpoint: '/api/brands'
    });
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500, headers: getSecurityHeaders() }
    );
  }
} 