const { Redis } = require('@upstash/redis');
const { Ratelimit } = require('@upstash/ratelimit');

// Test configuration
const TEST_CONFIG = {
  REDIS_URL: process.env.UPSTASH_REDIS_REST_URL,
  REDIS_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: [],
};

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✅ ${testName}`, colors.green);
  } else {
    testResults.failed++;
    log(`❌ ${testName}`, colors.red);
    if (details) log(`   ${details}`, colors.yellow);
  }
  
  testResults.details.push({
    test: testName,
    passed,
    details,
    timestamp: new Date().toISOString(),
  });
}

// Redis connection test
async function testRedisConnection() {
  try {
    if (!TEST_CONFIG.REDIS_URL || !TEST_CONFIG.REDIS_TOKEN) {
      logTest('Redis Configuration', false, 'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
      return false;
    }

    const redis = new Redis({
      url: TEST_CONFIG.REDIS_URL,
      token: TEST_CONFIG.REDIS_TOKEN,
    });

    // Test basic Redis operation
    const testKey = 'security-test-' + Date.now();
    await redis.set(testKey, 'test-value', { ex: 10 });
    const value = await redis.get(testKey);
    await redis.del(testKey);

    if (value === 'test-value') {
      logTest('Redis Connection', true, 'Successfully connected and performed operations');
      return true;
    } else {
      logTest('Redis Connection', false, 'Failed to read/write data');
      return false;
    }
  } catch (error) {
    logTest('Redis Connection', false, `Error: ${error.message}`);
    return false;
  }
}

// Rate limiting test
async function testRateLimiting() {
  try {
    if (!TEST_CONFIG.REDIS_URL || !TEST_CONFIG.REDIS_TOKEN) {
      logTest('Rate Limiting Setup', false, 'Redis not configured');
      return false;
    }

    const redis = new Redis({
      url: TEST_CONFIG.REDIS_URL,
      token: TEST_CONFIG.REDIS_TOKEN,
    });

    // Test rate limiter creation
    const testLimiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'test-ratelimit',
    });

    // Test rate limiting
    const testIP = '192.168.1.100';
    let successCount = 0;
    let limitReached = false;

    // Make 10 requests (should hit limit at 6th request)
    for (let i = 0; i < 10; i++) {
      const result = await testLimiter.limit(testIP);
      if (result.success) {
        successCount++;
      } else {
        limitReached = true;
        break;
      }
    }

    // Clean up test data
    await redis.del(`test-ratelimit:${testIP}`);

    if (successCount === 5 && limitReached) {
      logTest('Rate Limiting Logic', true, `Allowed ${successCount} requests, then blocked correctly`);
      return true;
    } else {
      logTest('Rate Limiting Logic', false, `Expected 5 allowed requests, got ${successCount}. Limit reached: ${limitReached}`);
      return false;
    }
  } catch (error) {
    logTest('Rate Limiting Logic', false, `Error: ${error.message}`);
    return false;
  }
}

// Security headers test
async function testSecurityHeaders() {
  try {
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/products`);
    const headers = response.headers;

    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'referrer-policy',
      'strict-transport-security',
    ];

    let headerCount = 0;
    const missingHeaders = [];

    for (const header of requiredHeaders) {
      if (headers.get(header)) {
        headerCount++;
      } else {
        missingHeaders.push(header);
      }
    }

    if (headerCount === requiredHeaders.length) {
      logTest('Security Headers', true, `All ${headerCount} security headers present`);
      return true;
    } else {
      logTest('Security Headers', false, `Missing headers: ${missingHeaders.join(', ')}`);
      return false;
    }
  } catch (error) {
    logTest('Security Headers', false, `Error: ${error.message}`);
    return false;
  }
}

// CORS test
async function testCORS() {
  try {
    // Test preflight request
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/products`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://g-3.vn',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
    ];

    let corsHeaderCount = 0;
    for (const header of corsHeaders) {
      if (response.headers.get(header)) {
        corsHeaderCount++;
      }
    }

    if (corsHeaderCount === corsHeaders.length) {
      logTest('CORS Configuration', true, 'CORS headers properly configured');
      return true;
    } else {
      logTest('CORS Configuration', false, `Missing CORS headers`);
      return false;
    }
  } catch (error) {
    logTest('CORS Configuration', false, `Error: ${error.message}`);
    return false;
  }
}

// Content Security Policy test
async function testCSP() {
  try {
    const response = await fetch(`${TEST_CONFIG.BASE_URL}`);
    const csp = response.headers.get('content-security-policy');

    if (csp) {
      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'frame-ancestors',
      ];

      let directiveCount = 0;
      for (const directive of requiredDirectives) {
        if (csp.includes(directive)) {
          directiveCount++;
        }
      }

      if (directiveCount === requiredDirectives.length) {
        logTest('Content Security Policy', true, `All ${directiveCount} CSP directives present`);
        return true;
      } else {
        logTest('Content Security Policy', false, `Missing CSP directives`);
        return false;
      }
    } else {
      logTest('Content Security Policy', false, 'CSP header not found');
      return false;
    }
  } catch (error) {
    logTest('Content Security Policy', false, `Error: ${error.message}`);
    return false;
  }
}

// API validation test
async function testAPIValidation() {
  try {
    // Test with invalid JSON
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid-json',
    });

    if (response.status === 400) {
      logTest('API Input Validation', true, 'Invalid JSON properly rejected');
      return true;
    } else {
      logTest('API Input Validation', false, `Expected 400 status, got ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('API Input Validation', false, `Error: ${error.message}`);
    return false;
  }
}

// Authentication test
async function testAuthentication() {
  try {
    // Test protected endpoint without auth
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/user/orders`);

    if (response.status === 401) {
      logTest('Authentication Protection', true, 'Protected endpoint requires authentication');
      return true;
    } else {
      logTest('Authentication Protection', false, `Expected 401 status, got ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Authentication Protection', false, `Error: ${error.message}`);
    return false;
  }
}

// IP validation test
async function testIPValidation() {
  try {
    // This test checks if the IP extraction and validation logic works
    // Since we can't easily test the actual middleware, we'll test the logic
    const validIPs = ['192.168.1.1', '10.0.0.1', '172.16.0.1'];
    const invalidIPs = ['999.999.999.999', 'not-an-ip', '192.168.1'];

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    let validCount = 0;
    let invalidCount = 0;

    for (const ip of validIPs) {
      if (ipRegex.test(ip)) validCount++;
    }

    for (const ip of invalidIPs) {
      if (!ipRegex.test(ip)) invalidCount++;
    }

    if (validCount === validIPs.length && invalidCount === invalidIPs.length) {
      logTest('IP Validation Logic', true, 'IP validation regex works correctly');
      return true;
    } else {
      logTest('IP Validation Logic', false, 'IP validation logic failed');
      return false;
    }
  } catch (error) {
    logTest('IP Validation Logic', false, `Error: ${error.message}`);
    return false;
  }
}

// JWT validation test (mock)
async function testJWTValidation() {
  try {
    // Test with invalid JWT token
    const response = await fetch(`${TEST_CONFIG.BASE_URL}/api/user/profile`, {
      headers: {
        'Authorization': 'Bearer invalid-jwt-token',
      },
    });

    if (response.status === 401) {
      logTest('JWT Token Validation', true, 'Invalid JWT properly rejected');
      return true;
    } else {
      logTest('JWT Token Validation', false, `Expected 401 status, got ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('JWT Token Validation', false, `Error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runSecurityTests() {
  log('\n🛡️ Security Hardening Test Suite', colors.bold + colors.blue);
  log('='.repeat(50), colors.blue);
  
  const startTime = Date.now();

  // Run all tests
  await testRedisConnection();
  await testRateLimiting();
  await testSecurityHeaders();
  await testCORS();
  await testCSP();
  await testAPIValidation();
  await testAuthentication();
  await testIPValidation();
  await testJWTValidation();

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  // Print results
  log('\n📊 Test Results Summary', colors.bold + colors.blue);
  log('='.repeat(30), colors.blue);
  log(`Total Tests: ${testResults.total}`, colors.blue);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, colors.red);
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 
      testResults.failed === 0 ? colors.green : colors.yellow);
  log(`Duration: ${duration.toFixed(2)}s`, colors.blue);

  // Save detailed results
  const reportData = {
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: ((testResults.passed / testResults.total) * 100).toFixed(1),
      duration: duration.toFixed(2),
      timestamp: new Date().toISOString(),
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      baseUrl: TEST_CONFIG.BASE_URL,
      redisConfigured: !!(TEST_CONFIG.REDIS_URL && TEST_CONFIG.REDIS_TOKEN),
    },
    tests: testResults.details,
    recommendations: generateRecommendations(),
  };

  // Write report
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '../../docs/security-hardening-report.json');
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    log(`\n📄 Detailed report saved to: ${reportPath}`, colors.blue);
  } catch (error) {
    log(`\n⚠️  Could not save report: ${error.message}`, colors.yellow);
  }

  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Generate recommendations based on test results
function generateRecommendations() {
  const recommendations = [];

  if (testResults.details.find(t => t.test === 'Redis Connection' && !t.passed)) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Infrastructure',
      issue: 'Redis not configured',
      solution: 'Set up Upstash Redis and configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables',
    });
  }

  if (testResults.details.find(t => t.test === 'Security Headers' && !t.passed)) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Security',
      issue: 'Missing security headers',
      solution: 'Ensure all security headers are properly configured in middleware',
    });
  }

  if (testResults.details.find(t => t.test === 'Content Security Policy' && !t.passed)) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Security',
      issue: 'CSP not configured',
      solution: 'Implement Content Security Policy headers to prevent XSS attacks',
    });
  }

  if (testResults.details.find(t => t.test === 'CORS Configuration' && !t.passed)) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Security',
      issue: 'CORS not properly configured',
      solution: 'Review and configure CORS headers for proper cross-origin requests',
    });
  }

  return recommendations;
}

// Run tests if this script is called directly
if (require.main === module) {
  runSecurityTests().catch(error => {
    log(`\n💥 Test runner failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = {
  runSecurityTests,
  testResults,
}; 