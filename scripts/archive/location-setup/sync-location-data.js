const { createClient } = require('@supabase/supabase-js');
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
const DELAY_BETWEEN_REQUESTS = 300; // ms

// Utility function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 1. Sync provinces from API
async function syncProvinces() {
  console.log('🏙️ SYNCING PROVINCES FROM API...\n');
  
  try {
    // Fetch provinces from API
    console.log('📡 Fetching provinces from API...');
    const response = await fetch(`${API_BASE_URL}/p/`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const provinces = await response.json();
    console.log(`📦 Fetched ${provinces.length} provinces`);
    
    // Prepare data for database
    const provincesData = provinces.map(province => ({
      code: province.code,
      name: province.name,
      codename: province.codename,
      division_type: province.division_type,
      phone_code: province.phone_code
    }));
    
    // Insert into database
    const { error } = await supabase
      .from('provinces')
      .upsert(provincesData, { onConflict: 'code' });
    
    if (error) {
      throw new Error(`Database Error: ${error.message}`);
    }
    
    console.log(`✅ Successfully synced ${provinces.length} provinces to database`);
    return provinces;
    
  } catch (error) {
    console.error('❌ Failed to sync provinces:', error.message);
    throw error;
  }
}

// 2. Sync districts for a province
async function syncDistrictsForProvince(provinceCode, provinceName) {
  try {
    console.log(`📍 Fetching districts for ${provinceName}...`);
    
    const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.districts || !Array.isArray(data.districts)) {
      console.log(`  ⚠️ No districts found for ${provinceName}`);
      return [];
    }
    
    // Prepare districts data
    const districtsData = data.districts.map(district => ({
      code: district.code,
      name: district.name,
      codename: district.codename,
      division_type: district.division_type,
      short_codename: district.short_codename,
      province_code: provinceCode
    }));
    
    // Insert districts
    const { error } = await supabase
      .from('districts')
      .upsert(districtsData, { onConflict: 'code' });
    
    if (error) {
      console.log(`  ❌ Error inserting districts for ${provinceName}: ${error.message}`);
      return [];
    }
    
    console.log(`  ✅ Synced ${districtsData.length} districts for ${provinceName}`);
    return districtsData;
    
  } catch (error) {
    console.log(`  ❌ Failed to sync districts for ${provinceName}: ${error.message}`);
    return [];
  }
}

// 3. Sync wards for a district
async function syncWardsForDistrict(districtCode, districtName) {
  try {
    const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.wards || !Array.isArray(data.wards)) {
      return [];
    }
    
    // Prepare wards data
    const wardsData = data.wards.map(ward => ({
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
        console.log(`    ❌ Error inserting wards batch for ${districtName}: ${error.message}`);
      }
    }
    
    console.log(`    ✅ Synced ${wardsData.length} wards for ${districtName}`);
    return wardsData;
    
  } catch (error) {
    console.log(`    ❌ Failed to sync wards for ${districtName}: ${error.message}`);
    return [];
  }
}

// 4. Full sync process
async function fullSync() {
  console.log('🚀 STARTING FULL LOCATION DATA SYNC...\n');
  const startTime = Date.now();
  
  try {
    // Step 1: Sync provinces
    const provinces = await syncProvinces();
    await delay(1000);
    
    // Step 2: Sync districts for all provinces
    console.log('\n🏘️ SYNCING DISTRICTS...\n');
    let totalDistricts = 0;
    
    for (let i = 0; i < provinces.length; i++) {
      const province = provinces[i];
      console.log(`[${i + 1}/${provinces.length}] Processing ${province.name}...`);
      
      const districts = await syncDistrictsForProvince(province.code, province.name);
      totalDistricts += districts.length;
      
      // Add delay between provinces to be nice to API
      await delay(DELAY_BETWEEN_REQUESTS);
    }
    
    console.log(`\n📊 Total districts synced: ${totalDistricts}`);
    
    // Step 3: Sync wards for all provinces (this might take a while)
    console.log('\n🏠 SYNCING WARDS FOR ALL PROVINCES...\n');
    console.log('Note: This will sync wards for all provinces - might take 10-15 minutes');
    
    // Get all provinces
    const { data: allProvinces, error: provincesError } = await supabase
      .from('provinces')
      .select('code, name')
      .order('code');
    
    if (provincesError || !allProvinces) {
      console.log('❌ Error fetching provinces');
      throw new Error('Failed to fetch provinces');
    }
    
    let totalWards = 0;
    
    for (let p = 0; p < allProvinces.length; p++) {
      const province = allProvinces[p];
      console.log(`\n[${p + 1}/${allProvinces.length}] 🏙️ ${province.name}...`);
      
      const { data: districts, error } = await supabase
        .from('districts')
        .select('code, name')
        .eq('province_code', province.code);
      
      if (error || !districts) {
        console.log(`  ❌ Error fetching districts for ${province.name}`);
        continue;
      }
      
      console.log(`  📍 Processing ${districts.length} districts...`);
      
      for (let i = 0; i < districts.length; i++) {
        const district = districts[i];
        console.log(`    [${i + 1}/${districts.length}] ${district.name}...`);
        
        const wards = await syncWardsForDistrict(district.code, district.name);
        totalWards += wards.length;
        
        // Reduced delay for efficiency but still be nice to API
        await delay(100);
      }
      
      // Longer delay between provinces
      await delay(500);
    }
    
    console.log(`\n📊 Total wards synced: ${totalWards} (all provinces)`);
    
    // Step 4: Update metadata
    console.log('\n📈 UPDATING METADATA...');
    const { error: metadataError } = await supabase
      .from('location_metadata')
      .upsert({
        cache_key: 'g3_location_data',
        total_provinces: provinces.length,
        total_districts: totalDistricts,
        total_wards: totalWards,
        last_updated: new Date().toISOString()
      }, { onConflict: 'cache_key' });
    
    if (metadataError) {
      console.log('⚠️ Failed to update metadata:', metadataError.message);
    } else {
      console.log('✅ Metadata updated');
    }
    
    // Final statistics
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    const durationMinutes = Math.round(duration / 60);
    
    console.log('\n🎉 SYNC COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(50));
    console.log(`⏱️ Total time: ${duration} seconds (${durationMinutes} minutes)`);
    console.log(`🏙️ Provinces: ${provinces.length}`);
    console.log(`🏘️ Districts: ${totalDistricts}`);
    console.log(`🏠 Wards: ${totalWards} (all provinces)`);
    console.log('═'.repeat(50));
    console.log('\n🌟 Complete location database ready for use!');
    
    return true;
  } catch (error) {
    console.error('\n❌ SYNC FAILED:', error.message);
    return false;
  }
}

// 5. Verify sync results
async function verifySyncResults() {
  console.log('🔍 VERIFYING SYNC RESULTS...\n');
  
  try {
    // Check table counts
    const tables = ['provinces', 'districts', 'wards'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: Error counting - ${error.message}`);
      } else {
        console.log(`📈 ${table}: ${count || 0} records`);
      }
    }
    
    // Check some sample data
    console.log('\n📋 SAMPLE DATA:');
    console.log('-'.repeat(40));
    
    // Sample provinces
    const { data: sampleProvinces } = await supabase
      .from('provinces')
      .select('name')
      .limit(5);
    
    if (sampleProvinces && sampleProvinces.length > 0) {
      console.log('🏙️ Sample provinces:', sampleProvinces.map(p => p.name).join(', '));
    }
    
    // Sample districts
    const { data: sampleDistricts } = await supabase
      .from('districts')
      .select('name, province_code')
      .limit(5);
    
    if (sampleDistricts && sampleDistricts.length > 0) {
      console.log('🏘️ Sample districts:', sampleDistricts.map(d => d.name).join(', '));
    }
    
    // Check metadata
    const { data: metadata, error: metaError } = await supabase
      .from('location_metadata')
      .select('*')
      .eq('cache_key', 'g3_location_data')
      .single();
    
    if (metaError) {
      console.log('\n❌ Metadata: Not found');
    } else {
      console.log('\n📊 SYNC METADATA:');
      console.log(`📅 Last updated: ${metadata.last_updated}`);
      console.log(`🏙️ Provinces: ${metadata.total_provinces}`);
      console.log(`🏘️ Districts: ${metadata.total_districts}`);
      console.log(`🏠 Wards: ${metadata.total_wards}`);
    }
    
    console.log('\n✅ Verification completed');
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🗺️ LOCATION DATA SYNC SCRIPT');
  console.log('============================\n');
  
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  
  try {
    switch (command) {
      case 'provinces':
        await syncProvinces();
        break;
      case 'verify':
        await verifySyncResults();
        break;
      case 'full':
      default:
        const success = await fullSync();
        if (success) {
          await delay(1000);
          await verifySyncResults();
        }
        break;
    }
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  }
  
  console.log('\n🏁 Script completed!');
}

// Run script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  syncProvinces,
  syncDistrictsForProvince,
  syncWardsForDistrict,
  fullSync,
  verifySyncResults
}; 