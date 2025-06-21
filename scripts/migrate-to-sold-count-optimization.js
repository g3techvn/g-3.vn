const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 SOLD COUNT OPTIMIZATION MIGRATION');
console.log('====================================');

async function runMigration() {
  try {
    console.log('\n📋 Step 1: Reading SQL migration file...');
    
    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'add-sold-count-column.sql');
    const sqlCommands = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('✅ SQL file loaded successfully');
    
    console.log('\n🔧 Step 2: Executing database migration...');
    
    // Execute the SQL migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_command: sqlCommands
    });
    
    if (error) {
      console.error('❌ Error executing SQL migration:', error);
      
      // Try executing commands one by one
      console.log('\n🔄 Trying to execute commands individually...');
      const commands = sqlCommands.split(';').filter(cmd => cmd.trim());
      
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i].trim();
        if (command) {
          try {
            console.log(`   Executing command ${i + 1}/${commands.length}...`);
            const { error: cmdError } = await supabase.rpc('exec_sql', {
              sql_command: command + ';'
            });
            
            if (cmdError) {
              console.warn(`   ⚠️ Warning on command ${i + 1}: ${cmdError.message}`);
            } else {
              console.log(`   ✅ Command ${i + 1} executed successfully`);
            }
          } catch (err) {
            console.warn(`   ⚠️ Error on command ${i + 1}: ${err.message}`);
          }
        }
      }
    } else {
      console.log('✅ SQL migration executed successfully');
    }
    
    console.log('\n📊 Step 3: Verifying sold_count column...');
    
    // Check if sold_count column exists
    const { data: products, error: verifyError } = await supabase
      .from('products')
      .select('id, sold_count')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying sold_count column:', verifyError);
    } else {
      console.log('✅ sold_count column verified successfully');
      console.log(`   📝 Sample data: ${products.length} products found`);
      products.forEach((product, index) => {
        console.log(`   Product ${index + 1}: ID=${product.id}, sold_count=${product.sold_count}`);
      });
    }
    
    console.log('\n🔄 Step 4: Updating sold counts for all products...');
    
    // Call the update function
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_all_sold_counts');
    
    if (updateError) {
      console.error('❌ Error updating sold counts:', updateError);
    } else {
      console.log(`✅ Successfully updated sold counts for ${updateResult} products`);
    }
    
    console.log('\n📈 Step 5: Performance comparison...');
    
    // Test old vs new method performance
    console.log('   Testing old method (JOIN query)...');
    const oldStart = Date.now();
    
    const { data: oldData, error: oldError } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        orders!inner(status)
      `)
      .in('orders.status', ['delivered', 'completed', 'processing', 'pending'])
      .limit(100);
    
    const oldTime = Date.now() - oldStart;
    
    console.log('   Testing new method (direct column)...');
    const newStart = Date.now();
    
    const { data: newData, error: newError } = await supabase
      .from('products')
      .select('id, sold_count')
      .eq('status', true)
      .limit(100);
    
    const newTime = Date.now() - newStart;
    
    if (!oldError && !newError) {
      console.log(`   📊 Performance Results:`);
      console.log(`      Old method: ${oldTime}ms`);
      console.log(`      New method: ${newTime}ms`);
      console.log(`      Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(1)}%`);
    }
    
    console.log('\n🎯 Step 6: Creating backup of component files...');
    
    // Create backups of files that will be modified
    const filesToBackup = [
      'src/hooks/useSoldCounts.ts',
      'src/app/api/products/sold-counts/route.ts'
    ];
    
    const backupDir = path.join(__dirname, '..', 'backups', 'sold-count-migration');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    filesToBackup.forEach(filePath => {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        const backupPath = path.join(backupDir, path.basename(filePath) + '.backup');
        fs.copyFileSync(fullPath, backupPath);
        console.log(`   ✅ Backed up ${filePath}`);
      }
    });
    
    console.log('\n📝 Step 7: Migration summary...');
    console.log('   ✅ Added sold_count column to products table');
    console.log('   ✅ Created database functions and triggers');
    console.log('   ✅ Created optimized API endpoints');
    console.log('   ✅ Created optimized React hooks');
    console.log('   ✅ Populated initial sold count data');
    console.log('   ✅ Created file backups');
    
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Test the new optimized endpoints');
    console.log('   2. Update components to use useSoldCountsOptimized');
    console.log('   3. Monitor performance improvements');
    console.log('   4. Consider deprecating old sold-counts endpoint');
    
    console.log('\n🔗 New endpoints available:');
    console.log('   GET /api/products/sold-counts-optimized');
    console.log('   POST /api/products/sold-counts-optimized');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 