# Redis Setup Guide for G3 Security System

## 🚀 Quick Setup (Upstash - Recommended)

### Step 1: Create Upstash Account
1. Go to https://upstash.com/
2. Sign up with GitHub/Google
3. Create new Redis database

### Step 2: Database Configuration
```
Name: g3-security-redis
Region: ap-southeast-1 (Singapore - closest to Vietnam)
Type: Pay as you go (or Free tier for testing)
```

### Step 3: Get Connection Details
After creating database, copy from Upstash Console:
- **REST API** tab → Copy URL and Token

### Step 4: Environment Variables
Create `.env.local` file in project root:

```bash
# Redis Configuration (REQUIRED)
UPSTASH_REDIS_REST_URL=https://apn1-xxx-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ

# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-for-security

# Domain Configuration
NEXT_PUBLIC_G3_URL=g-3.vn
NEXT_PUBLIC_BASE_URL=https://g-3.vn

# Optional: Rate Limiting (has defaults)
RATE_LIMIT_ORDERS=5
RATE_LIMIT_AUTH=10
RATE_LIMIT_API=100
RATE_LIMIT_PUBLIC=200
RATE_LIMIT_SEARCH=50

# Optional: Security Thresholds (has defaults)
SUSPICIOUS_ACTIVITY_THRESHOLD=50
AUTO_BLOCK_DURATION=3600000
MAX_DEVICES_PER_USER=5
SESSION_TIMEOUT=1800000
```

## 🔧 Alternative Options

### Option 2: Redis Cloud
1. Go to https://redis.com/
2. Create free account (30MB free)
3. Create database
4. Use connection string format

### Option 3: Local Redis (Development Only)
```bash
# Install Redis locally
brew install redis  # macOS
sudo apt install redis-server  # Ubuntu

# Start Redis
redis-server

# Environment variables for local
UPSTASH_REDIS_REST_URL=redis://localhost:6379
UPSTASH_REDIS_REST_TOKEN=  # Leave empty for local
```

### Option 4: Railway/Heroku Redis
If deploying on Railway/Heroku, use their Redis add-ons.

## 🧪 Testing Redis Connection

Run the security test to verify Redis setup:

```bash
cd scripts/security
node security-hardening-test.js
```

Expected output:
```
✅ Redis Configuration
✅ Redis Connection
✅ Rate Limiting Logic
```

## 📊 Redis Usage in G3 Security System

### Data Stored in Redis:
1. **Rate Limiting Counters**
   - `ratelimit:orders:IP` - Order rate limits
   - `ratelimit:auth:IP` - Auth rate limits
   - `ratelimit:api:IP` - API rate limits

2. **Suspicious Activity Tracking**
   - `suspicious:IP` - IP attempt counts
   - `blocked:IP` - Blocked IP information

3. **Authentication Data**
   - `refresh:TOKEN` - Refresh token data
   - `session:SESSION_ID` - Session information
   - `devices:USER_ID` - User device tracking
   - `blacklist:TOKEN` - Blacklisted tokens

### Redis Key Expiration:
- Rate limit keys: 60 seconds (sliding window)
- Suspicious activity: 1 hour
- Blocked IPs: 1 hour (configurable)
- Refresh tokens: 7 days
- Sessions: 30 minutes
- Device tracking: 7 days

## 🚨 Production Considerations

### Security:
- ✅ Use TLS/SSL for Redis connection
- ✅ Set strong authentication
- ✅ Use private networks when possible
- ✅ Regular backups

### Performance:
- ✅ Choose region close to your users
- ✅ Monitor Redis memory usage
- ✅ Set appropriate connection pooling
- ✅ Use Redis clustering for high traffic

### Monitoring:
- ✅ Set up Redis monitoring/alerts
- ✅ Track key expiration patterns
- ✅ Monitor connection count
- ✅ Watch for memory spikes

## 🔍 Troubleshooting

### Common Issues:

1. **Connection Failed**
   ```
   Error: fetch failed
   ```
   - Check UPSTASH_REDIS_REST_URL format
   - Verify UPSTASH_REDIS_REST_TOKEN
   - Check network connectivity

2. **Authentication Error**
   ```
   Error: Unauthorized
   ```
   - Verify Redis token is correct
   - Check if IP is whitelisted (if configured)

3. **Rate Limit Not Working**
   ```
   Rate limiting bypassed
   ```
   - Ensure Redis is connected
   - Check environment variables
   - Verify middleware is applied

### Debug Commands:
```bash
# Test Redis connection manually
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "YOUR_REDIS_URL/get/test-key"

# Check Redis keys (if you have Redis CLI access)
redis-cli KEYS "*"
redis-cli TTL "ratelimit:api:192.168.1.1"
```

## 📈 Scaling Considerations

### Traffic Levels:
- **Low Traffic** (< 1K req/day): Free Upstash tier
- **Medium Traffic** (< 100K req/day): Upstash Pro ($10/month)
- **High Traffic** (> 100K req/day): Upstash Enterprise or Redis Cloud

### Memory Usage:
- Rate limiting: ~1KB per unique IP per minute
- Sessions: ~2KB per active session
- Device tracking: ~1KB per device
- Suspicious activity: ~500B per tracked IP

**Estimated**: 1000 concurrent users ≈ 10MB Redis memory

## ✅ Setup Checklist

- [ ] Created Upstash Redis database
- [ ] Copied connection URL and token
- [ ] Added environment variables to `.env.local`
- [ ] Generated secure JWT_SECRET (32+ characters)
- [ ] Tested Redis connection with security script
- [ ] Verified rate limiting works
- [ ] Checked security dashboard shows data
- [ ] Set up production environment variables
- [ ] Configured monitoring/alerts (optional)

## 🆘 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Run the security test script
3. Check Upstash console for connection logs
4. Verify all environment variables are set correctly 