import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Khởi tạo Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdminUser() {
  console.log('🔍 Đang kiểm tra tài khoản admin...\n');

  try {
    // Kiểm tra bảng user_profiles trước
    console.log('📋 KIỂM TRA BẢNG user_profiles:');
    console.log('=' * 50);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'thanhtrang16490@gmail.com');

    if (profilesError) {
      console.error('❌ Lỗi khi query user_profiles:', profilesError);
    } else {
      console.log('✅ Kết quả từ user_profiles:');
      console.log(JSON.stringify(profiles, null, 2));
    }

    // Kiểm tra bảng users nếu có
    console.log('\n📋 KIỂM TRA BẢNG users:');
    console.log('=' * 50);
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'thanhtrang16490@gmail.com');

    if (usersError) {
      console.error('❌ Lỗi khi query users:', usersError);
    } else {
      console.log('✅ Kết quả từ users:');
      console.log(JSON.stringify(users, null, 2));
    }

    // Kiểm tra auth.users (nếu có quyền)
    console.log('\n📋 KIỂM TRA AUTH METADATA:');
    console.log('=' * 50);
    
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('❌ Không có session hiện tại:', authError.message);
    } else {
      console.log('✅ Current auth user:');
      console.log(JSON.stringify(authUser, null, 2));
    }

    // Kiểm tra tất cả users có role admin
    console.log('\n📋 TẤT CẢ USERS CÓ ROLE ADMIN:');
    console.log('=' * 50);

    // Thử cả hai bảng
    const { data: adminProfiles, error: adminProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin');

    if (!adminProfilesError && adminProfiles) {
      console.log('✅ Admin users từ user_profiles:');
      adminProfiles.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, ID: ${user.id}`);
      });
    }

    const { data: adminUsers, error: adminUsersError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');

    if (!adminUsersError && adminUsers) {
      console.log('✅ Admin users từ users:');
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, ID: ${user.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

// Chạy script
checkAdminUser()
  .then(() => {
    console.log('\n✅ Hoàn thành kiểm tra!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  }); 