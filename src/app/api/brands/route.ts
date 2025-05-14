import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Lấy các tham số query từ URL
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const brand_id = searchParams.get('brand_id');
    const sort = searchParams.get('sort');
    
    console.log('API Request - Query params:', { category_id, brand_id, sort });
    
    // Khởi tạo Supabase client
    const supabase = createServerClient();
    
    // Xây dựng query cơ bản
    let query = supabase
      .from('products')
      .select('*');
    
    // Thêm các điều kiện filter
    if (category_id) {
      query = query.eq('category_id', category_id);
    }
    
    if (brand_id) {
      query = query.eq('brand_id', brand_id);
    }
    
    // Thực hiện query để lấy dữ liệu
    const { data: products, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: `Lỗi khi truy vấn dữ liệu: ${error.message}` },
        { status: 500 }
      );
    }
    
    // Sắp xếp kết quả
    const sortedProducts = [...products];
    
    if (sort) {
      const [field, order] = sort.split(':');
      if (field && (order === 'asc' || order === 'desc')) {
        sortedProducts.sort((a, b) => {
          const aValue = a[field as keyof typeof a];
          const bValue = b[field as keyof typeof b];
          
          if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }
    } else {
      // Mặc định sắp xếp theo thời gian tạo
      sortedProducts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    
    console.log(`Query successful, returning ${sortedProducts.length} products`);
    return NextResponse.json({ products: sortedProducts });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: `Đã xảy ra lỗi khi xử lý yêu cầu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 