#!/usr/bin/env node

/**
 * Test script for provinces API
 * Run with: node scripts/test-provinces-api.js
 */

const API_URL = 'https://provinces.open-api.vn/api';

async function testAPI() {
  console.log('🔍 Testing provinces API...\n');

  try {
    // Test 1: Get all provinces
    console.log('1. Testing provinces endpoint...');
    const provincesResponse = await fetch(`${API_URL}/p/`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'G3-Test-Script/1.0'
      }
    });

    if (!provincesResponse.ok) {
      throw new Error(`HTTP ${provincesResponse.status}: ${provincesResponse.statusText}`);
    }

    const provinces = await provincesResponse.json();
    console.log(`✅ Provinces: ${provinces.length} items found`);
    console.log(`   First province: ${provinces[0]?.name} (code: ${provinces[0]?.code})`);

    // Test 2: Get districts for Hanoi (code: 1)
    console.log('\n2. Testing districts endpoint (Hanoi)...');
    const districtsResponse = await fetch(`${API_URL}/p/1?depth=2`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'G3-Test-Script/1.0'
      }
    });

    if (!districtsResponse.ok) {
      throw new Error(`HTTP ${districtsResponse.status}: ${districtsResponse.statusText}`);
    }

    const hanoi = await districtsResponse.json();
    console.log(`✅ Districts in Hanoi: ${hanoi.districts?.length || 0} items found`);
    
    if (hanoi.districts && hanoi.districts.length > 0) {
      console.log(`   First district: ${hanoi.districts[0].name} (code: ${hanoi.districts[0].code})`);

      // Test 3: Get wards for Ba Dinh (code: 1)
      console.log('\n3. Testing wards endpoint (Ba Dinh)...');
      const wardsResponse = await fetch(`${API_URL}/d/1?depth=2`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'G3-Test-Script/1.0'
        }
      });

      if (!wardsResponse.ok) {
        throw new Error(`HTTP ${wardsResponse.status}: ${wardsResponse.statusText}`);
      }

      const baDinh = await wardsResponse.json();
      console.log(`✅ Wards in Ba Dinh: ${baDinh.wards?.length || 0} items found`);
      
      if (baDinh.wards && baDinh.wards.length > 0) {
        console.log(`   First ward: ${baDinh.wards[0].name} (code: ${baDinh.wards[0].code})`);
      }
    }

    // Test 4: Performance test
    console.log('\n4. Testing API performance...');
    const startTime = Date.now();
    
    const performancePromises = [
      fetch(`${API_URL}/p/79?depth=2`), // Ho Chi Minh City
      fetch(`${API_URL}/p/48?depth=2`), // Da Nang
      fetch(`${API_URL}/p/31?depth=2`)  // Hai Phong
    ];

    await Promise.all(performancePromises);
    const endTime = Date.now();
    console.log(`✅ Performance test: ${endTime - startTime}ms for 3 concurrent requests`);

    console.log('\n🎉 All tests passed! API is working correctly.');

  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error('Error:', error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('\nPossible causes:');
      console.error('- Network connection issues');
      console.error('- API server is down');
      console.error('- Firewall blocking requests');
    } else if (error.message.includes('timeout')) {
      console.error('\nPossible causes:');
      console.error('- API response is too slow');
      console.error('- Network latency issues');
    } else if (error.message.includes('HTTP')) {
      console.error('\nPossible causes:');
      console.error('- API endpoint has changed');
      console.error('- Server error on API side');
      console.error('- Rate limiting');
    }

    console.error('\nRecommendations:');
    console.error('- Check your internet connection');
    console.error('- Try again in a few minutes');
    console.error('- Consider implementing fallback data');
    
    process.exit(1);
  }
}

// Test with error handling
async function testWithRetry() {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n🔄 Attempt ${attempt}/${maxRetries}`);
      await testAPI();
      break;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`\n💥 Failed after ${maxRetries} attempts`);
        process.exit(1);
      } else {
        console.warn(`⚠️  Attempt ${attempt} failed, retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
}

// Run the test
if (require.main === module) {
  testWithRetry();
}

module.exports = { testAPI, testWithRetry }; 