import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env.local') });

async function testSupabaseConnection() {
  console.log('\n🔍 Testing Supabase Connection...');
  
  // Log environment variables (masked)
  console.log('Environment Variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Missing required environment variables');
    return false;
  }
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test basic query
    console.log('\nTesting basic query...');
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);

    if (error) {
      console.error('❌ Query Error:', error.message);
      if (error.message.includes('Invalid API key')) {
        console.log('\n🔑 API Key Check:');
        console.log('Key Length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);
        console.log('Key Preview:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) + '...');
      }
      return false;
    }

    console.log('✅ Successfully connected to Supabase');
    console.log('Sample data:', data);
    return true;
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    return false;
  }
}

async function testProductsAPI() {
  console.log('\n🔍 Testing Products API...');
  
  try {
    // Test different endpoints
    const endpoints = [
      '/api/products',
      '/api/products?type=featured',
      '/api/products?type=new',
      '/api/products?type=combo'
    ];

    for (const endpoint of endpoints) {
      console.log(`\nTesting ${endpoint}...`);
      
      const response = await fetch(`http://localhost:3000${endpoint}`);
      const data = await response.json();
      
      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        console.error('❌ Error:', data.error);
        continue;
      }
      
      console.log('✅ Success');
      console.log('Products count:', data.products?.length || 0);
    }
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting Tests...');
  
  // Test Supabase connection first
  const supabaseOk = await testSupabaseConnection();
  if (!supabaseOk) {
    console.log('\n❌ Supabase connection failed. Skipping API tests.');
    return;
  }
  
  // If Supabase is OK, test the API
  await testProductsAPI();
}

runTests(); 