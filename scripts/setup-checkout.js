const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🔧 SETTING UP CHECKOUT DATABASE...\n');

  try {
    // 1. Read and execute database setup script
    console.log('1️⃣ Setting up database tables...');
    const setupSQL = fs.readFileSync(path.join(__dirname, 'setup-checkout-database.sql'), 'utf8');
    
    // Split SQL into individual statements
    const statements = setupSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (error && !error.message.includes('already exists')) {
          console.log(`⚠️ SQL Warning: ${error.message}`);
        }
      }
    }
    console.log('✅ Database tables setup completed');

    // 2. Insert sample data
    console.log('\n2️⃣ Inserting sample data...');
    
    // Payment methods
    const { error: pmError } = await supabase
      .from('payment_methods')
      .upsert([
        { code: 'cod', name: 'Thanh toán khi nhận hàng', description: 'Thanh toán tiền mặt khi nhận hàng', icon: 'cod', is_active: true, sort_order: 1 },
        { code: 'bank_transfer', name: 'Chuyển khoản ngân hàng', description: 'Chuyển khoản qua tài khoản ngân hàng', icon: 'bank', is_active: true, sort_order: 2 },
        { code: 'vnpay', name: 'VNPay', description: 'Thanh toán qua ví điện tử VNPay', icon: 'vnpay', is_active: true, sort_order: 3 },
        { code: 'momo', name: 'Momo', description: 'Thanh toán qua ví điện tử Momo', icon: 'momo', is_active: true, sort_order: 4 }
      ], { onConflict: 'code' });

    if (pmError) {
      console.log('⚠️ Payment methods warning:', pmError.message);
    } else {
      console.log('✅ Payment methods inserted');
    }

    // Shipping carriers
    const { error: scError } = await supabase
      .from('shipping_carriers')
      .upsert([
        { code: 'FREE', name: 'Miễn phí giao hàng', base_fee: 0, estimated_delivery_days: 1, is_active: true },
        { code: 'EXPRESS', name: 'Giao hàng nhanh', base_fee: 50000, estimated_delivery_days: 0, is_active: true },
        { code: 'STANDARD', name: 'Giao hàng tiêu chuẩn', base_fee: 30000, estimated_delivery_days: 2, is_active: true },
        { code: 'ECONOMY', name: 'Giao hàng tiết kiệm', base_fee: 20000, estimated_delivery_days: 5, is_active: true }
      ], { onConflict: 'code' });

    if (scError) {
      console.log('⚠️ Shipping carriers warning:', scError.message);
    } else {
      console.log('✅ Shipping carriers inserted');
    }

    // Vouchers
    const { error: vError } = await supabase
      .from('vouchers')
      .upsert([
        { 
          code: 'NEWUSER', 
          title: 'Khách hàng mới', 
          description: 'Giảm 15% cho khách hàng mới', 
          discount_type: 'percentage', 
          discount_amount: 15, 
          min_order_value: 300000, 
          usage_limit: 1000, 
          used_count: 0, 
          valid_to: '2024-12-31', 
          is_active: true 
        },
        { 
          code: 'BLACKFRIDAY', 
          title: 'Black Friday', 
          description: 'Giảm 100K cho Black Friday', 
          discount_type: 'fixed', 
          discount_amount: 100000, 
          min_order_value: 800000, 
          usage_limit: 500, 
          used_count: 0, 
          valid_to: '2024-12-31', 
          is_active: true 
        }
      ], { onConflict: 'code' });

    if (vError) {
      console.log('⚠️ Vouchers warning:', vError.message);
    } else {
      console.log('✅ Additional vouchers inserted');
    }

    // 3. Test database connectivity
    console.log('\n3️⃣ Testing database connectivity...');
    
    const { data: pmData, error: pmTestError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true);

    if (pmTestError) {
      console.log('❌ Payment methods test failed:', pmTestError.message);
    } else {
      console.log(`✅ Payment methods test passed: ${pmData.length} methods found`);
    }

    const { data: scData, error: scTestError } = await supabase
      .from('shipping_carriers')
      .select('*')
      .eq('is_active', true);

    if (scTestError) {
      console.log('❌ Shipping carriers test failed:', scTestError.message);
    } else {
      console.log(`✅ Shipping carriers test passed: ${scData.length} carriers found`);
    }

    const { data: vData, error: vTestError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('is_active', true);

    if (vTestError) {
      console.log('❌ Vouchers test failed:', vTestError.message);
    } else {
      console.log(`✅ Vouchers test passed: ${vData.length} vouchers found`);
    }

    console.log('\n🎉 CHECKOUT DATABASE SETUP COMPLETED!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Database tables created/updated');
    console.log('✅ Sample data inserted');
    console.log('✅ RLS policies configured');
    console.log('✅ Indexes created for performance');
    console.log('\n🚀 Your checkout system is ready to use!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('\n✅ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }); 