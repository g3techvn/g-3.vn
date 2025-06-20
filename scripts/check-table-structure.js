const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructures() {
  console.log('🔍 KIỂM TRA CẤU TRÚC CHI TIẾT CÁC BẢNG QUAN TRỌNG CHO CHECKOUT\n');

  // Kiểm tra từng bảng quan trọng
  const tablesToCheck = ['orders', 'order_items', 'vouchers', 'user_profiles', 'user_rewards', 'voucher_usages'];

  for (const tableName of tablesToCheck) {
    await checkSingleTable(tableName);
  }

  console.log('\n📋 TÓM TẮT CÁC BẢNG CẦN TẠO CHO CHECKOUT:');
  console.log('=' * 50);
  console.log('❌ users - Cần tạo bảng users hoặc sử dụng user_profiles');
  console.log('❌ shipping_addresses - Cần tạo bảng địa chỉ giao hàng');
  console.log('❌ payment_methods - Cần tạo bảng phương thức thanh toán');
  console.log('❌ shipping_carriers - Cần tạo bảng nhà vận chuyển');
}

async function checkSingleTable(tableName) {
  try {
    console.log(`🔍 KIỂM TRA BẢNG: ${tableName.toUpperCase()}`);
    console.log('='.repeat(40));

    // Lấy sample data
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Lỗi: ${error.message}\n`);
      return;
    }

    if (data && data.length > 0) {
      const fields = Object.keys(data[0]);
      console.log(`✅ Bảng có dữ liệu (${fields.length} trường):`);
      fields.forEach(field => console.log(`  - ${field}`));
    } else {
      console.log(`📝 Bảng trống - cần sample data để kiểm tra cấu trúc`);
    }

    console.log('\n');

  } catch (err) {
    console.log(`❌ Lỗi: ${err.message}\n`);
  }
}

// Chạy script
checkTableStructures()
  .then(() => {
    console.log('✅ Hoàn thành kiểm tra!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  }); 