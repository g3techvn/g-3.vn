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
    role: 'admin',
    metadata: {
      full_name: 'Admin User',
      phone: '0901234567'
    }
  },
  {
    email: 'sale@g3furniture.vn',
    role: 'sale',
    metadata: {
      full_name: 'Sale User',
      phone: '0901234568'
    }
  },
  {
    email: 'customer@gmail.com',
    role: 'customer',
    metadata: {
      full_name: 'Customer User',
      phone: '0901234569'
    }
  }
];

async function main() {
  console.log('🔧 UPDATING USER ROLES...\n');

  try {
    for (const user of TEST_USERS) {
      // Get user by email
      const { data: userData, error: userError } = await adminSupabase.auth.admin.listUsers();
      
      if (userError) {
        console.log(`❌ Failed to get users:`, userError.message);
        continue;
      }

      const existingUser = userData.users.find(u => u.email === user.email);
      
      if (!existingUser) {
        console.log(`❌ User ${user.email} not found`);
        continue;
      }

      // Update user's role and metadata
      const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
        existingUser.id,
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

      console.log(`✅ Updated ${user.role} user:`, {
        id: existingUser.id,
        email: existingUser.email,
        role: user.role
      });
    }

    console.log('\n✅ USER ROLES UPDATE COMPLETED!');

  } catch (error) {
    console.error('❌ Update failed with error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error); 