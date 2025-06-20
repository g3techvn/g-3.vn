#!/usr/bin/env node

/**
 * Setup script to initialize location data from provinces API
 * Run with: node scripts/setup-location-data.js
 */

const API_URL = 'https://provinces.open-api.vn/api';

async function fetchWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'G3-Setup-Script/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

async function setupLocationData() {
  console.log('🚀 Bắt đầu thiết lập dữ liệu địa điểm...\n');

  try {
    // Step 1: Fetch all provinces
    console.log('📍 Đang tải danh sách tỉnh thành...');
    const provinces = await fetchWithRetry(`${API_URL}/p/`);
    console.log(`✅ Đã tải ${provinces.length} tỉnh thành`);

    // Step 2: Fetch districts for all provinces
    console.log('\n🏘️ Đang tải danh sách quận huyện...');
    const allDistricts = [];
    let completedProvinces = 0;

    for (const province of provinces) {
      try {
        const data = await fetchWithRetry(`${API_URL}/p/${province.code}?depth=2`);
        if (data.districts) {
          allDistricts.push(...data.districts);
        }
        completedProvinces++;
        
        if (completedProvinces % 10 === 0 || completedProvinces === provinces.length) {
          console.log(`   Tiến độ: ${completedProvinces}/${provinces.length} tỉnh thành`);
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Lỗi khi tải quận huyện cho ${province.name}:`, error.message);
      }
    }

    console.log(`✅ Đã tải ${allDistricts.length} quận huyện`);

    // Step 3: Create location data structure
    const locationData = {
      provinces,
      districts: allDistricts,
      wards: [], // Wards will be loaded on-demand
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    // Step 4: Save to JSON file
    const fs = require('fs');
    const path = require('path');
    
    const outputDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'location-data.json');
    fs.writeFileSync(outputFile, JSON.stringify(locationData, null, 2));

    console.log(`\n💾 Đã lưu dữ liệu vào: ${outputFile}`);

    // Step 5: Generate summary
    const summary = {
      totalProvinces: provinces.length,
      totalDistricts: allDistricts.length,
      totalWards: 0,
      topProvinces: provinces.slice(0, 5).map(p => ({
        name: p.name,
        code: p.code,
        districts: allDistricts.filter(d => d.province_code === p.code).length
      })),
      generatedAt: new Date().toISOString()
    };

    const summaryFile = path.join(outputDir, 'location-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    console.log('\n📊 Thống kê:');
    console.log(`   Tỉnh/Thành phố: ${summary.totalProvinces}`);
    console.log(`   Quận/Huyện: ${summary.totalDistricts}`);
    console.log(`   Phường/Xã: Sẽ tải theo yêu cầu`);
    
    console.log('\n🎉 Thiết lập hoàn tất!');
    console.log('💡 Bạn có thể sử dụng dữ liệu này trong ứng dụng hoặc import vào Location Manager.');

  } catch (error) {
    console.error('\n❌ Lỗi khi thiết lập dữ liệu:', error.message);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupLocationData();
}

module.exports = { setupLocationData }; 