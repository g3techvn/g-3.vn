const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// API configuration
const API_BASE_URL = 'https://provinces.open-api.vn/api';
const DELAY_BETWEEN_REQUESTS = 100; // ms
const MAX_RETRIES = 3;

// Utility function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with retry logic
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`📡 Fetching: ${url} (attempt ${i + 1})`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      await delay(DELAY_BETWEEN_REQUESTS);
      return data;
    } catch (error) {
      console.log(`⚠️ Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries - 1) throw error;
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}

// 1. Create database tables
async function createTables() {
  console.log('📋 CREATING LOCATION TABLES IN DATABASE...\n');
  
  try {
    const sqlFile = path.join(__dirname, 'create-location-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL into individual statements and execute
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec', { 
            sql: statement + ';' 
          });
          
          if (error && !error.message.includes('already exists')) {
            console.log(`⚠️ SQL Warning ${i + 1}: ${error.message}`);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`❌ Statement ${i + 1} failed: ${err.message}`);
        }
      }
    }
    
    console.log('✅ Database tables created successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    return false;
  }
}

// 2. Fetch and insert provinces
async function syncProvinces() {
  console.log('🏙️ SYNCING PROVINCES...\n');
  
  try {
    // Fetch provinces from API
    const provinces = await fetchWithRetry(`${API_BASE_URL}/p/`);
    console.log(`📦 Fetched ${provinces.length} provinces from API`);
    
    // Prepare data for insertion
    const provincesData = provinces.map(province => ({
      code: province.code,
      name: province.name,
      codename: province.codename,
      division_type: province.division_type,
      phone_code: province.phone_code
    }));
    
    // Insert into database with upsert
    const { error } = await supabase
      .from('provinces')
      .upsert(provincesData, { onConflict: 'code' });
    
    if (error) {
      throw new Error(`Failed to insert provinces: ${error.message}`);
    }
    
    console.log(`✅ Successfully synced ${provinces.length} provinces`);
    return provinces;
  } catch (error) {
    console.error('❌ Failed to sync provinces:', error.message);
    throw error;
  }
}

// 3. Fetch and insert districts for a province
async function syncDistrictsForProvince(provinceCode) {
  try {
    const districts = await fetchWithRetry(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
    
    if (!districts.districts || !Array.isArray(districts.districts)) {
      console.log(`⚠️ No districts found for province ${provinceCode}`);
      return [];
    }
    
    // Prepare districts data
    const districtsData = districts.districts.map(district => ({
      code: district.code,
      name: district.name,
      codename: district.codename,
      division_type: district.division_type,
      short_codename: district.short_codename,
      province_code: provinceCode
    }));
    
    // Insert districts in batches
    const batchSize = 50;
    for (let i = 0; i < districtsData.length; i += batchSize) {
      const batch = districtsData.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('districts')
        .upsert(batch, { onConflict: 'code' });
      
      if (error) {
        console.log(`⚠️ Error inserting districts batch: ${error.message}`);
      }
    }
    
    console.log(`  ✅ ${districtsData.length} districts for province ${districts.name}`);
    return districtsData;
  } catch (error) {
    console.log(`  ❌ Failed to sync districts for province ${provinceCode}: ${error.message}`);
    return [];
  }
}

// 4. Fetch and insert wards for a district
async function syncWardsForDistrict(districtCode) {
  try {
    const district = await fetchWithRetry(`${API_BASE_URL}/d/${districtCode}?depth=2`);
    
    if (!district.wards || !Array.isArray(district.wards)) {
      return [];
    }
    
    // Prepare wards data
    const wardsData = district.wards.map(ward => ({
      code: ward.code,
      name: ward.name,
      codename: ward.codename,
      division_type: ward.division_type,
      short_codename: ward.short_codename,
      district_code: districtCode
    }));
    
    // Insert wards in batches
    const batchSize = 100;
    for (let i = 0; i < wardsData.length; i += batchSize) {
      const batch = wardsData.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('wards')
        .upsert(batch, { onConflict: 'code' });
      
      if (error) {
        console.log(`⚠️ Error inserting wards batch: ${error.message}`);
      }
    }
    
    console.log(`    ✅ ${wardsData.length} wards for district ${district.name}`);
    return wardsData;
  } catch (error) {
    console.log(`    ❌ Failed to sync wards for district ${districtCode}: ${error.message}`);
    return [];
  }
}

// 5. Full sync process
async function fullSync() {
  console.log('🚀 STARTING FULL LOCATION DATA SYNC...\n');
  const startTime = Date.now();
  
  try {
    // Step 1: Sync provinces
    const provinces = await syncProvinces();
    
    // Step 2: Sync districts
    console.log('\n🏘️ SYNCING DISTRICTS...\n');
    let totalDistricts = 0;
    
    for (let i = 0; i < provinces.length; i++) {
      const province = provinces[i];
      console.log(`📍 [${i + 1}/${provinces.length}] Processing ${province.name}...`);
      
      const districts = await syncDistrictsForProvince(province.code);
      totalDistricts += districts.length;
      
      // Add small delay between provinces
      await delay(200);
    }
    
    console.log(`\n📊 Total districts synced: ${totalDistricts}`);
    
    // Step 3: Ask user if they want to sync wards (optional, takes longer)
    console.log('\n⚠️ Ward synchronization can take 10-30 minutes...');
    console.log('🔄 Starting ward sync for major cities only (HN, HCM, DN)...\n');
    
    // Sync wards for major cities only
    const majorCities = [1, 79, 48]; // Hanoi, Ho Chi Minh, Da Nang
    let totalWards = 0;
    
    for (const provinceCode of majorCities) {
      const { data: districts, error } = await supabase
        .from('districts')
        .select('code, name')
        .eq('province_code', provinceCode);
      
      if (error || !districts) continue;
      
      console.log(`🏙️ SYNCING WARDS FOR PROVINCE ${provinceCode}...\n`);
      
      for (let i = 0; i < districts.length; i++) {
        const district = districts[i];
        console.log(`    📍 [${i + 1}/${districts.length}] Processing ${district.name}...`);
        
        const wards = await syncWardsForDistrict(district.code);
        totalWards += wards.length;
        
        await delay(150);
      }
    }
    
    console.log(`\n📊 Total wards synced: ${totalWards}`);
    
    // Step 4: Update metadata
    console.log('\n📈 UPDATING CACHE METADATA...\n');
    
    const { error: metadataError } = await supabase
      .rpc('update_location_cache_stats');
    
    if (metadataError) {
      console.log('⚠️ Failed to update metadata:', metadataError.message);
    } else {
      console.log('✅ Cache metadata updated');
    }
    
    // Final statistics
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 SYNC COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(50));
    console.log(`⏱️ Total time: ${duration} seconds`);
    console.log(`🏙️ Provinces: ${provinces.length}`);
    console.log(`🏘️ Districts: ${totalDistricts}`);
    console.log(`🏠 Wards: ${totalWards} (major cities only)`);
    console.log('═'.repeat(50));
    
    return true;
  } catch (error) {
    console.error('\n❌ SYNC FAILED:', error.message);
    return false;
  }
}

// 6. Verify database setup
async function verifyDatabase() {
  console.log('🔍 VERIFYING DATABASE SETUP...\n');
  
  try {
    // Check tables exist
    const tables = ['provinces', 'districts', 'wards', 'location_cache_metadata'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    }
    
    // Check data counts
    console.log('\n📊 DATA STATISTICS:');
    console.log('-'.repeat(30));
    
    for (const table of ['provinces', 'districts', 'wards']) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: Error counting`);
      } else {
        console.log(`📈 ${table}: ${count} records`);
      }
    }
    
    // Check metadata
    const { data: metadata, error: metaError } = await supabase
      .from('location_cache_metadata')
      .select('*')
      .single();
    
    if (metaError) {
      console.log('❌ Metadata: Error reading');
    } else {
      console.log('\n🔧 CACHE METADATA:');
      console.log(`📅 Last updated: ${metadata.last_updated}`);
      console.log(`📊 Complete: ${metadata.is_complete ? 'Yes' : 'No'}`);
      console.log(`🔗 API source: ${metadata.api_source}`);
    }
    
    console.log('\n✅ Database verification completed');
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🗺️ LOCATION DATABASE SETUP SCRIPT');
  console.log('================================\n');
  
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  
  switch (command) {
    case 'create':
      await createTables();
      break;
    case 'sync':
      await fullSync();
      break;
    case 'verify':
      await verifyDatabase();
      break;
    case 'full':
    default:
      console.log('🚀 Running full setup process...\n');
      const tablesCreated = await createTables();
      if (tablesCreated) {
        await delay(1000);
        const syncSuccess = await fullSync();
        if (syncSuccess) {
          await delay(1000);
          await verifyDatabase();
        }
      }
      break;
  }
  
  console.log('\n🏁 Script completed!');
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  createTables,
  syncProvinces,
  syncDistrictsForProvince,
  syncWardsForDistrict,
  fullSync,
  verifyDatabase
}; 