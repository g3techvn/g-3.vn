const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createLocationTables() {
  console.log('🗺️ CREATING LOCATION TABLES IN SUPABASE...\n');

  try {
    // 1. Create provinces table
    console.log('📋 Creating provinces table...');
    const provincesSQL = `
      CREATE TABLE IF NOT EXISTS provinces (
        id SERIAL PRIMARY KEY,
        code INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        codename VARCHAR(255),
        division_type VARCHAR(100),
        phone_code INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_provinces_code ON provinces(code);
      CREATE INDEX IF NOT EXISTS idx_provinces_name ON provinces(name);
    `;

    // Instead of using rpc('exec'), try direct query execution
    const { error: provincesError } = await supabase.rpc('exec_sql', { 
      query: provincesSQL 
    });

    if (provincesError) {
      console.log('⚠️ Provinces table warning:', provincesError.message);
    } else {
      console.log('✅ Provinces table created');
    }

    // 2. Create districts table
    console.log('📋 Creating districts table...');
    const districtsSQL = `
      CREATE TABLE IF NOT EXISTS districts (
        id SERIAL PRIMARY KEY,
        code INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        codename VARCHAR(255),
        division_type VARCHAR(100),
        short_codename VARCHAR(100),
        province_code INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_districts_code ON districts(code);
      CREATE INDEX IF NOT EXISTS idx_districts_province_code ON districts(province_code);
    `;

    const { error: districtsError } = await supabase.rpc('exec_sql', { 
      query: districtsSQL 
    });

    if (districtsError) {
      console.log('⚠️ Districts table warning:', districtsError.message);
    } else {
      console.log('✅ Districts table created');
    }

    // 3. Create wards table
    console.log('📋 Creating wards table...');
    const wardsSQL = `
      CREATE TABLE IF NOT EXISTS wards (
        id SERIAL PRIMARY KEY,
        code INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        codename VARCHAR(255),
        division_type VARCHAR(100),
        short_codename VARCHAR(100),
        district_code INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_wards_code ON wards(code);
      CREATE INDEX IF NOT EXISTS idx_wards_district_code ON wards(district_code);
    `;

    const { error: wardsError } = await supabase.rpc('exec_sql', { 
      query: wardsSQL 
    });

    if (wardsError) {
      console.log('⚠️ Wards table warning:', wardsError.message);
    } else {
      console.log('✅ Wards table created');
    }

    console.log('\n🎉 Location tables setup completed!');
    return true;

  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    
    // Show manual instructions
    console.log('\n📝 MANUAL SETUP REQUIRED:');
    console.log('Go to Supabase Dashboard > SQL Editor and run:');
    console.log('\n-- 1. Provinces table');
    console.log(`CREATE TABLE IF NOT EXISTS provinces (
  id SERIAL PRIMARY KEY,
  code INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  codename VARCHAR(255),
  division_type VARCHAR(100),
  phone_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provinces_code ON provinces(code);`);

    console.log('\n-- 2. Districts table');
    console.log(`CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  code INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  codename VARCHAR(255),
  division_type VARCHAR(100),
  short_codename VARCHAR(100),
  province_code INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_districts_code ON districts(code);
CREATE INDEX IF NOT EXISTS idx_districts_province_code ON districts(province_code);`);

    console.log('\n-- 3. Wards table');
    console.log(`CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  code INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  codename VARCHAR(255),
  division_type VARCHAR(100),
  short_codename VARCHAR(100),
  district_code INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wards_code ON wards(code);
CREATE INDEX IF NOT EXISTS idx_wards_district_code ON wards(district_code);`);

    return false;
  }
}

// Test API and insert data
async function insertLocationData() {
  console.log('\n📡 FETCHING DATA FROM API AND INSERTING...\n');

  try {
    // Fetch provinces
    console.log('🏙️ Fetching provinces...');
    const provincesResponse = await fetch('https://provinces.open-api.vn/api/p/');
    const provinces = await provincesResponse.json();
    
    console.log(`📦 Found ${provinces.length} provinces`);

    // Insert provinces
    const provincesData = provinces.map(p => ({
      code: p.code,
      name: p.name,
      codename: p.codename,
      division_type: p.division_type,
      phone_code: p.phone_code
    }));

    const { error: insertError } = await supabase
      .from('provinces')
      .upsert(provincesData, { onConflict: 'code' });

    if (insertError) {
      console.error('❌ Failed to insert provinces:', insertError.message);
      return false;
    }

    console.log('✅ Provinces inserted successfully');

    // Insert districts for first few provinces
    console.log('\n🏘️ Inserting districts for first 5 provinces...');
    let totalDistricts = 0;

    for (let i = 0; i < Math.min(5, provinces.length); i++) {
      const province = provinces[i];
      console.log(`📍 Processing ${province.name}...`);

      try {
        const districtResponse = await fetch(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
        const districtData = await districtResponse.json();

        if (districtData.districts && districtData.districts.length > 0) {
          const districts = districtData.districts.map(d => ({
            code: d.code,
            name: d.name,
            codename: d.codename,
            division_type: d.division_type,
            short_codename: d.short_codename,
            province_code: province.code
          }));

          const { error: districtError } = await supabase
            .from('districts')
            .upsert(districts, { onConflict: 'code' });

          if (districtError) {
            console.log(`  ⚠️ Error inserting districts: ${districtError.message}`);
          } else {
            console.log(`  ✅ Inserted ${districts.length} districts`);
            totalDistricts += districts.length;
          }
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.log(`  ❌ Error processing ${province.name}: ${err.message}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`🏙️ Provinces: ${provinces.length}`);
    console.log(`🏘️ Districts: ${totalDistricts}`);
    console.log('\n✅ Data insertion completed successfully!');

    return true;
  } catch (error) {
    console.error('❌ Failed to insert data:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 SETTING UP LOCATION DATABASE...\n');

  const tablesCreated = await createLocationTables();
  
  if (tablesCreated) {
    await insertLocationData();
  } else {
    console.log('\n⚠️ Please create tables manually in Supabase Dashboard first');
  }

  console.log('\n🏁 Setup completed!');
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { createLocationTables, insertLocationData }; 