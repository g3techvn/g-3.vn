const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 DISABLING RLS FOR CHECKOUT TABLES...\n');
console.log('Supabase URL:', supabaseUrl ? 'OK' : 'MISSING');
console.log('Service Role Key:', serviceRoleKey ? 'OK' : 'MISSING');

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function disableRLS() {
  try {
    console.log('\n1️⃣ Testing service role access...');
    
    // Test basic query with service role
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Service role test failed:', testError.message);
      return;
    }
    
    console.log('✅ Service role access working');
    
    console.log('\n2️⃣ Attempting to disable RLS for orders table...');
    
    // Use raw SQL to disable RLS
    const { data, error } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE orders DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.log('⚠️ RLS disable attempt:', error.message);
      
      // Alternative: Try inserting directly with service role
      console.log('\n3️⃣ Testing direct order insertion...');
      
      const testOrder = {
        user_id: null,
        customer_name: 'Test Service Role',
        customer_phone: '0987654321',
        customer_email: 'servicetest@example.com',
        shipping_address: '123 Service Test St',
        shipping_fee: 0,
        payment_method: 'cod',
        subtotal: 150000,
        total_price: 150000,
        status: 'pending'
      };
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single();
      
      if (orderError) {
        console.log('❌ Service role order insertion failed:', orderError.message);
        console.log('\n📝 RECOMMENDATION:');
        console.log('   Go to Supabase Dashboard > Authentication > Policies');
        console.log('   And manually disable RLS for orders and order_items tables');
        console.log('   OR create policies that allow INSERT for service_role');
      } else {
        console.log('✅ Service role order insertion successful:', orderData.id);
        
        // Clean up test order
        await supabase.from('orders').delete().eq('id', orderData.id);
        console.log('✅ Test order cleaned up');
        
        console.log('\n🎉 SERVICE ROLE IS WORKING!');
        console.log('   The API should now be able to create orders');
      }
    } else {
      console.log('✅ RLS disabled successfully');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

disableRLS()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }); 