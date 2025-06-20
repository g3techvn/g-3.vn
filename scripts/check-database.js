const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Khởi tạo Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('🔍 Đang kiểm tra cấu trúc database Supabase...\n');

  try {
    // 1. Kiểm tra các bảng hiện có thông qua information_schema
    console.log('📋 DANH SÁCH CÁC BẢNG HIỆN CÓ:');
    console.log('=' * 50);
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name');

    if (tablesError) {
      console.error('❌ Lỗi khi lấy danh sách bảng:', tablesError);
      
      // Fallback: thử kiểm tra từng bảng một cách trực tiếp
      console.log('\n🔄 Thử phương pháp fallback...');
      await checkTablesDirectly();
      return;
    }

    if (tables && tables.length > 0) {
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
      
      console.log(`\n📊 Tổng cộng: ${tables.length} bảng\n`);

      // 2. Kiểm tra cấu trúc từng bảng quan trọng
      const importantTables = [
        'users', 'products', 'orders', 'order_items', 
        'user_rewards', 'vouchers', 'promotion', 'brands', 
        'product_cats', 'sectors', 'product_sectors',
        'product_variants', 'shipping_addresses', 'payment_methods'
      ];

      for (const tableName of importantTables) {
        const tableExists = tables.some(t => t.table_name === tableName);
        if (tableExists) {
          await checkTableStructure(tableName);
        }
      }
    } else {
      console.log('❌ Không tìm thấy bảng nào hoặc không có quyền truy cập');
      await checkTablesDirectly();
    }

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra database:', error);
    await checkTablesDirectly();
  }
}

async function checkTablesDirectly() {
  console.log('\n🔍 KIỂM TRA TRỰC TIẾP CÁC BẢNG:');
  console.log('=' * 40);

  const tablesToCheck = [
    'blog_cats', 'blogs', 'brands', 'order_items', 'orders',
    'product_cats', 'product_sectors', 'product_variant_suppliers',
    'product_variants', 'products', 'promotion', 'reward_transactions',
    'sectors', 'supplier_fulfillments', 'suppliers', 'user_profiles',
    'user_rewards', 'user_roles', 'voucher_usages', 'vouchers',
    'warranties', 'warranty_claims',
    // Các bảng có thể chưa tồn tại nhưng cần cho checkout
    'users', 'shipping_addresses', 'payment_methods', 'shipping_carriers'
  ];

  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log(`❌ ${tableName} - Bảng không tồn tại`);
        } else {
          console.log(`⚠️  ${tableName} - Lỗi: ${error.message}`);
        }
      } else {
        console.log(`✅ ${tableName} - Bảng tồn tại`);
        
        // Lấy một record để xem cấu trúc
        if (data && data.length > 0) {
          const sampleRecord = data[0];
          const fields = Object.keys(sampleRecord);
          console.log(`   📝 Các trường: ${fields.join(', ')}`);
        } else {
          console.log(`   📝 Bảng trống`);
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName} - Lỗi kết nối: ${err.message}`);
    }
  }
}

async function checkTableStructure(tableName) {
  try {
    console.log(`\n🔍 KIỂM TRA BẢNG: ${tableName.toUpperCase()}`);
    console.log('-'.repeat(30));

    // Lấy cấu trúc cột từ information_schema
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');

    if (error) {
      console.log(`❌ Không thể lấy cấu trúc bảng: ${error.message}`);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('Cột | Kiểu dữ liệu | Nullable | Mặc định');
      console.log('-'.repeat(60));
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'Yes' : 'No';
        const defaultVal = col.column_default || 'None';
        console.log(`${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | ${nullable.padEnd(8)} | ${defaultVal}`);
      });
    }

    // Đếm số lượng record
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📊 Số lượng record: ${count || 0}`);
    }

  } catch (err) {
    console.log(`❌ Lỗi khi kiểm tra bảng ${tableName}: ${err.message}`);
  }
}

// Chạy script
checkDatabase()
  .then(() => {
    console.log('\n✅ Hoàn thành kiểm tra database!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  }); 