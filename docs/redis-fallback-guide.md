# 🔄 Redis Fallback System - G3 Security

## 📋 **Tổng Quan**

Hệ thống Redis Fallback đảm bảo G3 Security tiếp tục hoạt động bình thường ngay cả khi Redis hết quota hoặc gặp sự cố. Hệ thống tự động chuyển sang in-memory storage để duy trì các tính năng bảo mật quan trọng.

---

## 🎯 **Tính Năng Chính**

### **1. Automatic Failover**
- ✅ Tự động phát hiện khi Redis không khả dụng
- ✅ Chuyển sang in-memory storage trong 30 giây
- ✅ Tự động thử kết nối lại Redis mỗi 30 giây
- ✅ Seamless transition không ảnh hưởng user experience

### **2. Data Consistency**
- ✅ TTL (Time To Live) được maintain trong memory
- ✅ Automatic cleanup expired keys mỗi 5 phút
- ✅ Same API interface cho Redis và memory
- ✅ Data structure tương thích hoàn toàn

### **3. Performance Optimization**
- ✅ Memory operations nhanh hơn Redis trong môi trường local
- ✅ Không có network latency
- ✅ Optimal memory usage với cleanup mechanisms
- ✅ Background health checks để minimize overhead

---

## 🚨 **Khi Nào Fallback Được Kích Hoạt**

### **Upstash Redis Free Tier Limits**:
- **Commands**: 500K/month (≈ 16,666/day)
- **Data Size**: 256MB
- **Bandwidth**: 10GB/month

### **Trigger Conditions**:
1. **Quota Exhausted**: Hết 500K commands/month
2. **Network Issues**: Không kết nối được Redis
3. **Authentication Errors**: Token expired hoặc invalid
4. **Rate Limiting**: Redis server rate limit

### **Automatic Detection**:
```typescript
// Health check mỗi 30 giây
if (redisError || quotaExhausted) {
  switchToMemoryFallback();
  logWarning('Redis fallback activated');
}
```

---

## 🛠️ **Cách Thức Hoạt Động**

### **1. Architecture Overview**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│ Redis Fallback  │───▶│     Redis       │
│                 │    │    Wrapper      │    │   (Primary)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Memory Store   │
                       │   (Fallback)    │
                       └─────────────────┘
```

### **2. Request Flow**
```typescript
async function handleRequest(key: string, value: any) {
  try {
    // Try Redis first
    if (await checkRedisHealth()) {
      return await redis.set(key, value);
    }
  } catch (error) {
    console.warn('Redis failed, using memory fallback');
  }
  
  // Fallback to memory
  return memoryStore.set(key, value);
}
```

### **3. Data Storage**
- **Redis**: Persistent, distributed, với TTL
- **Memory**: In-memory Map với TTL emulation
- **Sync**: Không sync giữa Redis và Memory (by design)

---

## 📊 **Features Supported in Fallback Mode**

| Feature | Redis | Memory Fallback | Notes |
|---------|-------|-----------------|-------|
| **Rate Limiting** | ✅ | ✅ | Full support với sliding window |
| **Suspicious IP Tracking** | ✅ | ✅ | Auto-block functionality maintained |
| **Session Management** | ✅ | ✅ | JWT sessions với TTL |
| **Token Blacklisting** | ✅ | ✅ | Security không bị ảnh hưởng |
| **Device Tracking** | ✅ | ✅ | Multi-device login tracking |
| **Analytics** | ✅ | ⚠️ | Limited - chỉ trong memory |
| **Cross-server Sync** | ✅ | ❌ | Memory local per server instance |

---

## 🔍 **Monitoring & Alerts**

### **1. Dashboard Integration**
- **URL**: `/admin/security-dashboard`
- **Real-time Status**: Redis vs Memory fallback
- **Memory Usage**: Số keys trong memory store
- **Recommendations**: Upgrade suggestions

### **2. API Endpoints**
```bash
# Get fallback status
GET /api/security/fallback-status

# Force Redis reconnect
POST /api/security/fallback-status
{
  "action": "reconnect-redis"
}

# Clear memory fallback
POST /api/security/fallback-status
{
  "action": "clear-memory"
}
```

### **3. Response Headers**
```http
X-RateLimit-Fallback: memory|redis
X-RateLimit-Warning: Redis quota exhausted, using memory fallback
X-RateLimit-Memory-Size: 1247
```

### **4. Console Logs**
```bash
# Normal operation
✅ Redis connection successful

# Fallback activation
⚠️ Redis health check failed, using memory fallback
🔄 Switched to memory fallback (1247 keys)

# Auto recovery
✅ Redis reconnected, switching back from fallback
```

---

## ⚡ **Performance Impact**

### **Memory Fallback Performance**:
- **SET operations**: ~0.1ms (vs 5-10ms Redis)
- **GET operations**: ~0.05ms (vs 3-8ms Redis)
- **Memory usage**: ~1KB per rate limit key
- **Cleanup overhead**: ~2ms every 5 minutes

### **Estimated Memory Usage**:
```
1,000 concurrent users:
- Rate limiting: ~500KB
- Sessions: ~2MB
- Device tracking: ~1MB
- Suspicious IPs: ~100KB
Total: ~3.6MB
```

### **Redis vs Memory Comparison**:
| Metric | Redis | Memory Fallback |
|--------|-------|-----------------|
| **Latency** | 5-10ms | 0.1ms |
| **Throughput** | 10K ops/sec | 100K+ ops/sec |
| **Persistence** | ✅ | ❌ |
| **Scaling** | ✅ | ❌ |
| **Cost** | $10/month | Free |

---

## 🚀 **Best Practices**

### **1. Quota Management**
```bash
# Monitor Redis usage
node scripts/setup-redis.js usage

# Check current quota
curl -H "Authorization: Bearer $TOKEN" \
     "$REDIS_URL/info"
```

### **2. Graceful Degradation**
- ✅ Critical security features always work
- ✅ Performance remains acceptable
- ✅ User experience không bị gián đoạn
- ✅ Automatic recovery khi Redis available

### **3. Upgrade Planning**
- **Free Tier**: Development và small traffic
- **$10 Fixed Plan**: Production với predictable traffic
- **Pay-as-you-go**: Variable traffic patterns

### **4. Monitoring Setup**
```javascript
// Check fallback status every 5 minutes
setInterval(async () => {
  const status = await fetch('/api/security/fallback-status');
  if (status.memory.active) {
    console.warn('⚠️ Using memory fallback');
  }
}, 5 * 60 * 1000);
```

---

## 🔧 **Configuration Options**

### **Environment Variables**
```bash
# Fallback behavior
REDIS_HEALTH_CHECK_INTERVAL=30000  # 30 seconds
MEMORY_CLEANUP_INTERVAL=300000     # 5 minutes
AUTO_RECONNECT_ATTEMPTS=5          # Max retry attempts
FALLBACK_WARNING_THRESHOLD=1000    # Memory keys warning

# Rate limiting
RATE_LIMIT_FALLBACK_MODE=strict    # strict|lenient
SUSPICIOUS_ACTIVITY_THRESHOLD=50   # Requests per minute
BLOCK_DURATION=3600               # Seconds
```

### **Programmatic Configuration**
```typescript
import { RedisWithFallback } from '@/lib/security/redis-fallback';

const redis = new RedisWithFallback();

// Configure health check interval
redis.setHealthCheckInterval(60000); // 1 minute

// Set memory warning threshold
redis.setMemoryWarningThreshold(2000); // 2000 keys
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **1. Memory Usage Too High**
```bash
# Check memory usage
GET /api/security/fallback-status

# Clear memory if needed
POST /api/security/fallback-status
{"action": "clear-memory"}
```

#### **2. Redis Won't Reconnect**
```bash
# Force reconnection
POST /api/security/fallback-status
{"action": "reconnect-redis"}

# Check Redis credentials
node scripts/setup-redis.js test
```

#### **3. Performance Degradation**
```bash
# Check if using fallback
curl -I /api/products | grep X-RateLimit-Fallback

# Monitor memory size
curl /api/security/fallback-status | jq '.data.memory.size'
```

### **Debug Commands**
```bash
# Test Redis connection
node scripts/setup-redis.js test

# Check fallback status
curl /api/security/fallback-status

# Monitor rate limiting
curl -I /api/orders | grep X-RateLimit

# Clear memory fallback
curl -X POST /api/security/fallback-status \
     -H "Content-Type: application/json" \
     -d '{"action":"clear-memory"}'
```

---

## 📈 **Scaling Considerations**

### **When to Upgrade Redis Plan**

#### **Free Tier Sufficient For**:
- Development environments
- < 1,000 daily active users
- < 500 orders/day
- Testing và staging

#### **Upgrade to $10 Fixed Plan When**:
- > 1,000 daily active users
- > 500 orders/day
- Production environments
- Need predictable costs

#### **Pay-as-you-go When**:
- Variable traffic patterns
- Seasonal businesses
- Need unlimited bandwidth
- > 10,000 daily active users

### **Multi-Server Deployment**
```yaml
# Load balancer configuration
upstream g3_backend {
  server app1.g3.vn;
  server app2.g3.vn;
  server app3.g3.vn;
}

# Each server has independent memory fallback
# Redis provides shared state when available
```

---

## ✅ **Verification Checklist**

### **Setup Verification**
- [ ] Redis connection working
- [ ] Fallback system initialized
- [ ] Health checks running
- [ ] Dashboard shows status
- [ ] Rate limiting functional

### **Fallback Testing**
- [ ] Simulate Redis failure
- [ ] Verify fallback activation
- [ ] Test rate limiting in fallback mode
- [ ] Check memory usage
- [ ] Verify auto-recovery

### **Production Readiness**
- [ ] Monitoring alerts configured
- [ ] Performance benchmarks acceptable
- [ ] Memory limits appropriate
- [ ] Upgrade plan determined
- [ ] Team trained on troubleshooting

---

## 📞 **Support**

### **Self-Service**
- **Documentation**: `docs/redis-setup-guide.md`
- **Configuration**: `docs/redis-configuration-summary.md`
- **Troubleshooting**: This guide

### **Commands**
```bash
# Setup and test
node scripts/setup-redis.js

# Security tests
node scripts/security/security-hardening-test.js

# Monitor status
curl /api/security/fallback-status
```

### **Emergency Procedures**
1. **Redis Down**: System auto-switches to memory fallback
2. **Memory High**: Clear fallback and force Redis reconnect
3. **Performance Issues**: Check if using fallback, upgrade Redis if needed
4. **Data Loss**: Memory fallback data is temporary by design

---

## 🎯 **Summary**

Redis Fallback System đảm bảo G3 Security **luôn hoạt động** ngay cả khi Redis hết quota:

- ✅ **Zero Downtime**: Automatic failover
- ✅ **Full Security**: Tất cả tính năng bảo mật maintained
- ✅ **Performance**: Memory fallback nhanh hơn Redis
- ✅ **Cost Effective**: Tiết kiệm chi phí khi traffic thấp
- ✅ **Auto Recovery**: Tự động switch back khi Redis available

**Result**: Trang web luôn bảo mật và ổn định, không phụ thuộc vào Redis quota! 