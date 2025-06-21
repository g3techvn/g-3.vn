const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Generate secure JWT secret
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Create .env.local template
function createEnvTemplate() {
  const jwtSecret = generateJWTSecret();
  
  const envContent = `# Redis Configuration (REQUIRED for Security Features)
# Get these from https://upstash.com/ after creating a Redis database
UPSTASH_REDIS_REST_URL=https://your-region-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ

# JWT Configuration (REQUIRED for Authentication)
JWT_SECRET=${jwtSecret}

# Domain Configuration
NEXT_PUBLIC_G3_URL=g-3.vn
NEXT_PUBLIC_BASE_URL=https://g-3.vn

# Optional: Rate Limiting Configuration (has default values)
RATE_LIMIT_ORDERS=5
RATE_LIMIT_AUTH=10
RATE_LIMIT_API=100
RATE_LIMIT_PUBLIC=200
RATE_LIMIT_SEARCH=50

# Optional: Security Thresholds (has default values)
SUSPICIOUS_ACTIVITY_THRESHOLD=50
AUTO_BLOCK_DURATION=3600000
MAX_DEVICES_PER_USER=5
SESSION_TIMEOUT=1800000

# Environment
NODE_ENV=development
`;

  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    log('⚠️  .env.local already exists. Creating .env.template instead', colors.yellow);
    fs.writeFileSync(path.join(process.cwd(), '.env.template'), envContent);
    log('✅ Created .env.template with secure JWT secret', colors.green);
  } else {
    fs.writeFileSync(envPath, envContent);
    log('✅ Created .env.local with secure JWT secret', colors.green);
  }
  
  return jwtSecret;
}

// Test Redis connection
async function testRedisConnection() {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!redisUrl || !redisToken) {
      log('❌ Redis not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN', colors.red);
      return false;
    }
    
    if (redisUrl.includes('your-region-xxxxx')) {
      log('❌ Please replace placeholder Redis URL with actual Upstash URL', colors.red);
      return false;
    }
    
    if (redisToken.includes('Axxxxx')) {
      log('❌ Please replace placeholder Redis token with actual Upstash token', colors.red);
      return false;
    }
    
    // Test basic Redis operation
    const testKey = 'setup-test-' + Date.now();
    const testValue = 'test-value';
    
    // Set value
    const setResponse = await fetch(`${redisUrl}/set/${testKey}/${testValue}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${redisToken}`,
      },
    });
    
    if (!setResponse.ok) {
      throw new Error(`Set failed: ${setResponse.status} ${setResponse.statusText}`);
    }
    
    // Get value
    const getResponse = await fetch(`${redisUrl}/get/${testKey}`, {
      headers: {
        'Authorization': `Bearer ${redisToken}`,
      },
    });
    
    if (!getResponse.ok) {
      throw new Error(`Get failed: ${getResponse.status} ${getResponse.statusText}`);
    }
    
    const result = await getResponse.json();
    
    // Clean up
    await fetch(`${redisUrl}/del/${testKey}`, {
      headers: {
        'Authorization': `Bearer ${redisToken}`,
      },
    });
    
    if (result.result === testValue) {
      log('✅ Redis connection successful!', colors.green);
      return true;
    } else {
      log('❌ Redis test failed: unexpected value returned', colors.red);
      return false;
    }
    
  } catch (error) {
    log(`❌ Redis connection failed: ${error.message}`, colors.red);
    return false;
  }
}

// Main setup function
async function setupRedis() {
  log('\n🔧 G3 Security System - Redis Setup', colors.bold + colors.blue);
  log('=' .repeat(50), colors.blue);
  
  // Step 1: Create environment file
  log('\n📝 Step 1: Creating environment configuration...', colors.blue);
  const jwtSecret = createEnvTemplate();
  log(`   Generated JWT Secret: ${jwtSecret.substring(0, 16)}...`, colors.green);
  
  // Step 2: Check if Redis is configured
  log('\n🔍 Step 2: Checking Redis configuration...', colors.blue);
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!redisUrl || !redisToken || redisUrl.includes('your-region-xxxxx')) {
    log('\n⚠️  Redis not configured yet!', colors.yellow);
    log('\nTo complete setup:', colors.yellow);
    log('1. Go to https://upstash.com/', colors.yellow);
    log('2. Create a new Redis database', colors.yellow);
    log('3. Copy the REST API URL and Token', colors.yellow);
    log('4. Update .env.local with your actual Redis credentials', colors.yellow);
    log('5. Run this script again to test connection', colors.yellow);
    return;
  }
  
  // Step 3: Test Redis connection
  log('\n🧪 Step 3: Testing Redis connection...', colors.blue);
  const isConnected = await testRedisConnection();
  
  if (isConnected) {
    log('\n🎉 Setup completed successfully!', colors.bold + colors.green);
    log('\nNext steps:', colors.green);
    log('1. ✅ Redis is configured and working', colors.green);
    log('2. ✅ JWT secret is generated', colors.green);
    log('3. 🚀 Start your application: npm run dev', colors.green);
    log('4. 🛡️  Visit /admin/security-dashboard to monitor security', colors.green);
    
    // Step 4: Run security tests
    log('\n🔬 Running security tests...', colors.blue);
    try {
      const { spawn } = require('child_process');
      const testProcess = spawn('node', ['scripts/security/security-hardening-test.js'], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      
      testProcess.on('close', (code) => {
        if (code === 0) {
          log('\n✅ All security tests passed!', colors.green);
        } else {
          log('\n⚠️  Some security tests failed. Check the output above.', colors.yellow);
        }
      });
    } catch (error) {
      log('\n⚠️  Could not run security tests automatically', colors.yellow);
      log('   Run manually: cd scripts/security && node security-hardening-test.js', colors.yellow);
    }
  } else {
    log('\n❌ Setup incomplete', colors.red);
    log('\nTroubleshooting:', colors.red);
    log('1. Verify your Upstash Redis URL and token are correct', colors.red);
    log('2. Check if your IP is whitelisted in Upstash console', colors.red);
    log('3. Ensure the Redis database is active', colors.red);
    log('4. Try the manual test in docs/redis-setup-guide.md', colors.red);
  }
}

// Show Redis usage info
function showRedisUsage() {
  log('\n📊 Redis Usage in G3 Security System:', colors.blue);
  log('   • Rate limiting counters (60s TTL)', colors.reset);
  log('   • Suspicious IP tracking (1h TTL)', colors.reset);
  log('   • JWT refresh tokens (7d TTL)', colors.reset);
  log('   • User sessions (30min TTL)', colors.reset);
  log('   • Device tracking (7d TTL)', colors.reset);
  log('   • Token blacklist (variable TTL)', colors.reset);
  
  log('\n💾 Estimated Memory Usage:', colors.blue);
  log('   • 1000 users: ~10MB Redis memory', colors.reset);
  log('   • 10000 users: ~100MB Redis memory', colors.reset);
  
  log('\n🎯 Rate Limits:', colors.blue);
  log('   • Orders: 5/minute', colors.reset);
  log('   • Auth: 10/minute', colors.reset);
  log('   • API: 100/minute', colors.reset);
  log('   • Public: 200/minute', colors.reset);
  log('   • Search: 50/minute', colors.reset);
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'test':
    testRedisConnection();
    break;
  case 'generate-jwt':
    const secret = generateJWTSecret();
    log(`Generated JWT Secret: ${secret}`, colors.green);
    break;
  case 'usage':
    showRedisUsage();
    break;
  case 'help':
    log('\n🔧 G3 Redis Setup Commands:', colors.blue);
    log('   node scripts/setup-redis.js        - Full setup wizard', colors.reset);
    log('   node scripts/setup-redis.js test   - Test Redis connection', colors.reset);
    log('   node scripts/setup-redis.js generate-jwt - Generate JWT secret', colors.reset);
    log('   node scripts/setup-redis.js usage  - Show Redis usage info', colors.reset);
    log('   node scripts/setup-redis.js help   - Show this help', colors.reset);
    break;
  default:
    setupRedis();
    showRedisUsage();
}

module.exports = {
  setupRedis,
  testRedisConnection,
  generateJWTSecret,
  createEnvTemplate,
}; 