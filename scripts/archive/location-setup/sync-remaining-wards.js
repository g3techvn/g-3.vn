const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// API configuration
const API_BASE_URL = 'https://provinces.open-api.vn/api';
const DELAY_BETWEEN_REQUESTS = 200; // ms

// Utility function for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sync wards for a district
async function syncWardsForDistrict(districtCode, districtName) {
  try {
    const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.wards || !Array.isArray(data.wards)) {
      return 0;
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
    let totalInserted = 0;
    
    for (let i = 0; i < wardsData.length; i += batchSize) {
      const batch = wardsData.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('wards')
        .upsert(batch, { onConflict: 'code' });
      
      if (error) {
        console.log(`    ❌ Error inserting wards batch for ${districtName}: ${error.message}`);
      } else {
        totalInserted += batch.length;
      }
    }
    
    return totalInserted;
    
  } catch (error) {
    console.log(`    ❌ Failed to sync wards for ${districtName}: ${error.message}`);
    return 0;
  }
}

// Get districts without wards or with incomplete wards
async function getDistrictsNeedingWards() {
  try {
    console.log('🔍 Analyzing districts that need wards...\n');
    
    // Get all districts
    const { data: allDistricts, error: districtsError } = await supabase
      .from('districts')
      .select('code, name, province_code')
      .order('province_code, name');
    
    if (districtsError) {
      throw new Error(`Error fetching districts: ${districtsError.message}`);
    }
    
    console.log(`📊 Total districts: ${allDistricts.length}`);
    
    // Get count of wards per district
    const { data: wardCounts, error: wardsError } = await supabase
      .from('wards')
      .select('district_code')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        // Count wards per district
        const counts = {};
        data.forEach(ward => {
          counts[ward.district_code] = (counts[ward.district_code] || 0) + 1;
        });
        
        return { data: counts, error: null };
      });
    
    if (wardsError) {
      throw new Error(`Error counting wards: ${wardsError.message}`);
    }
    
    // Find districts with no wards or very few wards (likely incomplete)
    const districtsNeedingWards = [];
    const provinceCounts = {};
    
    allDistricts.forEach(district => {
      const wardCount = wardCounts[district.code] || 0;
      
      // Track by province
      if (!provinceCounts[district.province_code]) {
        provinceCounts[district.province_code] = {
          total: 0,
          withWards: 0,
          withoutWards: 0
        };
      }
      
      provinceCounts[district.province_code].total++;
      
      // Districts with 0 wards or very few wards (less than 3) are likely incomplete
      if (wardCount < 3) {
        districtsNeedingWards.push({
          ...district,
          currentWardCount: wardCount
        });
        provinceCounts[district.province_code].withoutWards++;
      } else {
        provinceCounts[district.province_code].withWards++;
      }
    });
    
    console.log('📈 WARD COVERAGE BY PROVINCE:');
    console.log('-'.repeat(60));
    
    // Get province names for display
    const { data: provinces } = await supabase
      .from('provinces')
      .select('code, name');
    
    const provinceMap = {};
    provinces.forEach(p => provinceMap[p.code] = p.name);
    
    Object.keys(provinceCounts).forEach(provinceCode => {
      const stats = provinceCounts[provinceCode];
      const provinceName = provinceMap[provinceCode] || `Province ${provinceCode}`;
      const percentage = Math.round((stats.withWards / stats.total) * 100);
      
      console.log(`${provinceName}: ${stats.withWards}/${stats.total} districts (${percentage}%) have wards`);
    });
    
    console.log('-'.repeat(60));
    console.log(`🎯 Found ${districtsNeedingWards.length} districts needing ward sync\n`);
    
    return districtsNeedingWards;
    
  } catch (error) {
    console.error('Error analyzing districts:', error);
    throw error;
  }
}

// Main sync function for remaining wards
async function syncRemainingWards() {
  console.log('🔄 SYNCING REMAINING WARDS...\n');
  const startTime = Date.now();
  
  try {
    // Get districts needing wards
    const districtsToSync = await getDistrictsNeedingWards();
    
    if (districtsToSync.length === 0) {
      console.log('✅ All districts already have wards!');
      return true;
    }
    
    console.log(`🚀 Starting sync for ${districtsToSync.length} districts...\n`);
    
    let totalWardsAdded = 0;
    let processedCount = 0;
    const errors = [];
    
    // Group by province for better logging
    const byProvince = {};
    districtsToSync.forEach(district => {
      if (!byProvince[district.province_code]) {
        byProvince[district.province_code] = [];
      }
      byProvince[district.province_code].push(district);
    });
    
    // Process each province
    for (const [provinceCode, districts] of Object.entries(byProvince)) {
      console.log(`\n🏙️ Processing province ${provinceCode} (${districts.length} districts)...`);
      
      for (let i = 0; i < districts.length; i++) {
        const district = districts[i];
        processedCount++;
        
        console.log(`  [${processedCount}/${districtsToSync.length}] ${district.name} (current: ${district.currentWardCount} wards)...`);
        
        try {
          const wardsAdded = await syncWardsForDistrict(district.code, district.name);
          if (wardsAdded > 0) {
            console.log(`    ✅ Added ${wardsAdded} wards`);
            totalWardsAdded += wardsAdded;
          } else {
            console.log(`    ⚠️ No wards found or no new wards added`);
          }
        } catch (error) {
          console.log(`    ❌ Error: ${error.message}`);
          errors.push({ district: district.name, error: error.message });
        }
        
        // Delay between districts
        await delay(DELAY_BETWEEN_REQUESTS);
      }
      
      // Longer delay between provinces
      await delay(500);
    }
    
    // Update metadata
    console.log('\n📈 UPDATING METADATA...');
    
    // Get current counts
    const { count: provincesCount } = await supabase
      .from('provinces')
      .select('*', { count: 'exact', head: true });
    
    const { count: districtsCount } = await supabase
      .from('districts')
      .select('*', { count: 'exact', head: true });
    
    const { count: wardsCount } = await supabase
      .from('wards')
      .select('*', { count: 'exact', head: true });
    
    const { error: metadataError } = await supabase
      .from('location_metadata')
      .upsert({
        cache_key: 'g3_location_data',
        total_provinces: provincesCount || 0,
        total_districts: districtsCount || 0,
        total_wards: wardsCount || 0,
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
    
    console.log('\n🎉 REMAINING WARDS SYNC COMPLETED!');
    console.log('═'.repeat(50));
    console.log(`⏱️ Total time: ${duration} seconds`);
    console.log(`📍 Districts processed: ${processedCount}`);
    console.log(`🏠 Wards added: ${totalWardsAdded}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`📊 Current totals: ${provincesCount} provinces, ${districtsCount} districts, ${wardsCount} wards`);
    console.log('═'.repeat(50));
    
    if (errors.length > 0) {
      console.log('\n⚠️ ERRORS ENCOUNTERED:');
      errors.forEach(err => {
        console.log(`  - ${err.district}: ${err.error}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ SYNC FAILED:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔄 REMAINING WARDS SYNC SCRIPT');
  console.log('==============================\n');
  
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';
  
  try {
    switch (command) {
      case 'analyze':
        await getDistrictsNeedingWards();
        break;
      case 'sync':
      default:
        const success = await syncRemainingWards();
        if (success) {
          console.log('\n✅ All remaining wards synced successfully!');
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
  syncWardsForDistrict,
  getDistrictsNeedingWards,
  syncRemainingWards
}; 