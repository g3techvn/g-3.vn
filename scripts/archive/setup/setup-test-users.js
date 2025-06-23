const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Admin client for bypassing RLS
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_USERS = [
  {
    email: 'admin@g3furniture.vn',
    password: 'Admin@123456',
    role: 'admin',
    metadata: {
      full_name: 'Admin User',
      phone: '0901234567'
    }
  },
  {
    email: 'sale@g3furniture.vn',
    password: 'Sale@123456',
    role: 'sale',
    metadata: {
      full_name: 'Sale User',
      phone: '0901234568'
    }
  },
  {
    email: 'customer@gmail.com',
    password: 'Customer@123456',
    role: 'customer',
    metadata: {
      full_name: 'Customer User',
      phone: '0901234569'
    }
  }
];

async function main() {
  console.log('🔧 SETTING UP TEST USERS...\n');

  try {
    for (const user of TEST_USERS) {
      // Check if user already exists
      const { data: existingUser } = await adminSupabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (existingUser) {
        console.log(`ℹ️ User ${user.email} already exists, skipping...`);
        continue;
      }

      // Create user with admin API
      const { data: userData, error: userError } = await adminSupabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata,
        app_metadata: { role: user.role }
      });

      if (userError) {
        console.log(`❌ Failed to create ${user.role} user:`, userError.message);
        continue;
      }

      console.log(`✅ Created ${user.role} user:`, {
        id: userData.user.id,
        email: userData.user.email,
        role: user.role
      });

      // Update user's role and metadata
      const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
        userData.user.id,
        {
          app_metadata: { role: user.role },
          user_metadata: user.metadata,
          role: user.role
        }
      );

      if (updateError) {
        console.log(`❌ Failed to update ${user.role} metadata:`, updateError.message);
        continue;
      }

      console.log(`✅ Updated ${user.role} metadata and role`);
    }

    console.log('\n✅ TEST USERS SETUP COMPLETED!');
    console.log('\n📋 SUMMARY:');
    console.log('You can now log in with these test accounts:');
    TEST_USERS.forEach(user => {
      console.log(`\n${user.role.toUpperCase()}:`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Setup failed with error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error); 