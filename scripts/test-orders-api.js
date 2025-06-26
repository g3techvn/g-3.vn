import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testOrdersAPI() {
  console.log('🔍 Testing admin orders API...\n');

  try {
    // Test 1: Check if orders table exists
    console.log('📋 TEST 1: Check orders table structure');
    const { data: tableInfo, error: tableError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Orders table error:', tableError);
      return;
    }
    console.log('✅ Orders table accessible');

    // Test 2: Count total orders
    console.log('\n📋 TEST 2: Count total orders');
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count error:', countError);
    } else {
      console.log('✅ Total orders:', count);
    }

    // Test 3: Fetch orders with order_items
    console.log('\n📋 TEST 3: Fetch orders with items');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price,
          total_price,
          product_image
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error('❌ Orders query error:', ordersError);
    } else {
      console.log('✅ Orders fetched:', orders?.length || 0);
      if (orders && orders.length > 0) {
        console.log('📄 Sample order:', JSON.stringify(orders[0], null, 2));
      }
    }

    // Test 4: Check user_profiles table for admin user
    console.log('\n📋 TEST 4: Check admin user profile');
    const { data: adminUser, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'thanhtrang16490@gmail.com')
      .single();

    if (adminError) {
      console.error('❌ Admin user error:', adminError);
    } else {
      console.log('✅ Admin user found:', adminUser);
    }

    // Test 5: Simulate exact API query
    console.log('\n📋 TEST 5: Simulate exact API query');
    const page = 1;
    const limit = 10;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data: apiOrders, error: apiError, count: apiCount } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price,
          total_price,
          product_image
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (apiError) {
      console.error('❌ API simulation error:', apiError);
    } else {
      console.log('✅ API simulation success:', {
        ordersCount: apiOrders?.length || 0,
        totalCount: apiCount,
        totalPages: apiCount ? Math.ceil(apiCount / limit) : 1
      });
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testOrdersAPI(); 