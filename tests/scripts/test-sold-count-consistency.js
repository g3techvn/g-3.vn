const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧪 TESTING SOLD COUNT CONSISTENCY');
console.log('=================================');

async function testConsistency() {
  try {
    console.log('\n📋 Step 1: Getting sample products...');
    
    // Get 20 random products for testing
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, sold_count')
      .eq('status', true)
      .limit(20);
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }
    
    console.log(`✅ Found ${products.length} products to test`);
    
    console.log('\n🔍 Step 2: Calculating sold counts using old method (JOIN)...');
    
    const oldMethodResults = new Map();
    
    for (const product of products) {
      const { data: orderItems, error: orderError } = await supabase
        .from('order_items')
        .select(`
          quantity,
          orders!inner(status)
        `)
        .eq('product_id', product.id)
        .in('orders.status', ['delivered', 'completed', 'processing', 'pending']);
      
      if (orderError) {
        console.error(`❌ Error for product ${product.id}:`, orderError);
        continue;
      }
      
      const totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      oldMethodResults.set(product.id, totalSold);
    }
    
    console.log('✅ Old method calculations completed');
    
    console.log('\n📊 Step 3: Comparing with new method (sold_count column)...');
    
    let consistentCount = 0;
    let inconsistentCount = 0;
    const discrepancies = [];
    
    products.forEach(product => {
      const oldValue = oldMethodResults.get(product.id) || 0;
      const newValue = product.sold_count || 0;
      
      if (oldValue === newValue) {
        consistentCount++;
        console.log(`✅ ${product.name} (ID: ${product.id}): ${oldValue} = ${newValue}`);
      } else {
        inconsistentCount++;
        console.log(`❌ ${product.name} (ID: ${product.id}): OLD=${oldValue} vs NEW=${newValue}`);
        discrepancies.push({
          id: product.id,
          name: product.name,
          oldValue,
          newValue,
          difference: Math.abs(oldValue - newValue)
        });
      }
    });
    
    console.log('\n📈 Step 4: Performance comparison...');
    
    // Test performance of both methods
    const productIds = products.slice(0, 10).map(p => p.id);
    
    // Old method performance
    console.log('   Testing old method performance...');
    const oldStart = Date.now();
    
    const { data: oldPerfData, error: oldPerfError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        orders!inner(status)
      `)
      .in('product_id', productIds)
      .in('orders.status', ['delivered', 'completed', 'processing', 'pending']);
    
    const oldTime = Date.now() - oldStart;
    
    // New method performance
    console.log('   Testing new method performance...');
    const newStart = Date.now();
    
    const { data: newPerfData, error: newPerfError } = await supabase
      .from('products')
      .select('id, sold_count')
      .in('id', productIds);
    
    const newTime = Date.now() - newStart;
    
    console.log('\n🎯 RESULTS SUMMARY:');
    console.log('==================');
    console.log(`✅ Consistent products: ${consistentCount}/${products.length} (${(consistentCount/products.length*100).toFixed(1)}%)`);
    console.log(`❌ Inconsistent products: ${inconsistentCount}/${products.length} (${(inconsistentCount/products.length*100).toFixed(1)}%)`);
    
    if (!oldPerfError && !newPerfError) {
      console.log(`\n📊 Performance Comparison:`);
      console.log(`   Old method (JOIN): ${oldTime}ms`);
      console.log(`   New method (Column): ${newTime}ms`);
      console.log(`   Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(1)}% faster`);
    }
    
    if (discrepancies.length > 0) {
      console.log('\n🔧 FIXING DISCREPANCIES:');
      console.log('========================');
      
      for (const discrepancy of discrepancies) {
        console.log(`\n   Updating product ${discrepancy.id} (${discrepancy.name}):`);
        console.log(`   Current: ${discrepancy.newValue}, Correct: ${discrepancy.oldValue}`);
        
        // Update using the stored procedure
        const { data: updateData, error: updateError } = await supabase
          .rpc('update_product_sold_count', {
            product_id_param: parseInt(discrepancy.id, 10)
          });
        
        if (updateError) {
          console.log(`   ❌ Failed to update: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated successfully. New value: ${updateData}`);
        }
      }
    }
    
    console.log('\n🎉 CONSISTENCY TEST COMPLETED!');
    
    if (consistentCount === products.length) {
      console.log('🎯 ALL DATA IS CONSISTENT - Ready for production!');
      return true;
    } else {
      console.log('⚠️  Some discrepancies found and fixed. Please run test again.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testConsistency().then(success => {
  process.exit(success ? 0 : 1);
}); 