const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const TEST_USERS = [
  {
    email: 'admin@g3furniture.vn',
    password: 'Admin@123456',
    role: 'admin'
  },
  {
    email: 'sale@g3furniture.vn',
    password: 'Sale@123456',
    role: 'sale'
  },
  {
    email: 'customer@gmail.com',
    password: 'Customer@123456',
    role: 'customer'
  }
];

async function testUserPermissions(user) {
  console.log(`\n🔑 Testing ${user.role.toUpperCase()} permissions...`);
  
  // Create client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password
  });

  if (signInError) {
    console.log(`❌ ${user.role} sign in failed:`, signInError.message);
    return;
  }

  console.log(`✅ ${user.role} signed in successfully`);
  
  // Debug JWT and metadata
  const { data: { session } } = await supabase.auth.getSession();
  console.log('\nDebug Info:');
  console.log('JWT Token:', session?.access_token);
  console.log('User Metadata:', session?.user.user_metadata);
  console.log('App Metadata:', session?.user.app_metadata);
  console.log('Role:', session?.user.role);
  console.log('');

  // Test read permissions
  console.log('\nTesting read permissions:');

  // Orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .limit(5);

  console.log('Orders:', ordersError ? '❌ Access denied' : `✅ Can read ${orders.length} orders`);

  // Order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .limit(5);

  console.log('Order items:', itemsError ? '❌ Access denied' : `✅ Can read ${items.length} items`);

  // Shipping addresses
  const { data: addresses, error: addressesError } = await supabase
    .from('shipping_addresses')
    .select('*')
    .limit(5);

  console.log('Shipping addresses:', addressesError ? '❌ Access denied' : `✅ Can read ${addresses.length} addresses`);

  // Test write permissions for customer
  if (user.role === 'customer') {
    console.log('\nTesting customer write permissions:');

    // Create shipping address
    const { data: newAddress, error: createAddressError } = await supabase
      .from('shipping_addresses')
      .insert({
        user_id: signInData.user.id,
        full_name: 'Test User',
        phone: '0901234567',
        province_code: 79,
        district_code: 760,
        ward_code: 26734,
        address_detail: 'Test Address',
        is_default: true
      })
      .select()
      .single();

    console.log('Create address:', createAddressError ? '❌ Failed' : '✅ Success');

    if (newAddress) {
      // Create order
      const { data: newOrder, error: createOrderError } = await supabase
        .from('orders')
        .insert({
          user_id: signInData.user.id,
          status: 'pending',
          total_amount: 1000000,
          payment_method_id: 1,
          shipping_carrier_id: 1,
          shipping_address_id: newAddress.id,
          notes: 'Test order'
        })
        .select()
        .single();

      console.log('Create order:', createOrderError ? '❌ Failed' : '✅ Success');

      if (newOrder) {
        // Create order item
        const { error: createItemError } = await supabase
          .from('order_items')
          .insert({
            order_id: newOrder.id,
            product_id: 1,
            variant_id: null,
            quantity: 1,
            price: 1000000,
            created_at: new Date().toISOString()
          });

        console.log('Create order item:', createItemError ? '❌ Failed' : '✅ Success');
      }
    }
  }

  // Test write permissions for sale
  if (user.role === 'sale') {
    console.log('\nTesting sale write permissions:');

    // Update order status
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', 1);

    console.log('Update order:', updateOrderError ? '❌ Failed' : '✅ Success');
  }

  // Sign out
  await supabase.auth.signOut();
  console.log(`\n👋 ${user.role} signed out`);
}

async function main() {
  console.log('🔧 TESTING ROLE-BASED PERMISSIONS...\n');

  try {
    for (const user of TEST_USERS) {
      await testUserPermissions(user);
    }

    console.log('\n✅ PERMISSION TESTS COMPLETED!');

  } catch (error) {
    console.error('❌ Tests failed with error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error); 