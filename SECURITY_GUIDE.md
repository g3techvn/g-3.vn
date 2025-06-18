# 🛡️ Hướng dẫn Bảo mật G-3.vn

## 📋 Tổng quan
Website G-3.vn đã được trang bị hệ thống bảo mật toàn diện với các tính năng hiện đại để bảo vệ khỏi các mối đe dọa phổ biến.

## 🔐 Tính năng Bảo mật Đã Triển khai

### 1. **Environment Variables Security**
```bash
# .env.local (đã được bảo vệ trong .gitignore)
NEXT_PUBLIC_SUPABASE_URL=https://static.g-3.vn
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. **Input Validation với Zod**
```typescript
// Sử dụng trong API
import { CreateOrderSchema, validateRequestBody } from '@/lib/validation';

const validation = validateRequestBody(CreateOrderSchema, body);
if (!validation.success) {
  return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
}
```

### 3. **Rate Limiting**
```typescript
// Cấu hình rate limit
export const RATE_LIMITS = {
  ORDERS: { interval: 60000, uniqueTokenPerInterval: 5 },    // 5 đơn/phút
  API_GENERAL: { interval: 60000, uniqueTokenPerInterval: 100 }, // 100 req/phút
  AUTH: { interval: 60000, uniqueTokenPerInterval: 10 },     // 10 auth/phút
  PUBLIC: { interval: 60000, uniqueTokenPerInterval: 200 },  // 200 req/phút
};
```

### 4. **Security Headers**
Tự động áp dụng cho tất cả responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`

### 5. **Authentication & Authorization**
```typescript
// Middleware tự động kiểm tra auth
const authContext = await authenticateRequest(request);

// Protected routes
const PROTECTED_ROUTES = ['/api/orders', '/tai-khoan', '/gio-hang'];
const ADMIN_ROUTES = ['/api/admin', '/admin'];
```

### 6. **Logging & Monitoring**
```typescript
// Tự động log các sự kiện bảo mật
logRateLimitExceeded(ip, endpoint, userAgent);
logValidationFailed(ip, endpoint, errors, userAgent);
logOrderCreated(ip, orderId, userId, userAgent);
logSuspiciousRequest(ip, endpoint, reason, userAgent);
```

### 7. **API Versioning**
```typescript
// API v1 (legacy)
POST /api/orders

// API v2 (mới với cấu trúc response cải tiến)
POST /api/v2/orders

// Headers
X-API-Version: v2
API-Version: v2
```

## 🚨 Phát hiện Hoạt động Đáng ngờ

### Bot Detection
```typescript
const botPatterns = [/bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i];
```

### Missing Headers Check
```typescript
// Kiểm tra thiếu headers phổ biến của browser
const hasReferer = request.headers.get('referer');
const hasAccept = request.headers.get('accept');
```

### Rate Limit cho từng loại User
```typescript
// Authenticated users: 200 req/phút
// Admin users: 1000 req/phút  
// Guest users: 50 req/phút
```

## 🔧 Cách sử dụng

### 1. **Tạo API mới với bảo mật**
```typescript
import { 
  rateLimit, 
  getSecurityHeaders, 
  getClientIP 
} from '@/lib/rate-limit';
import { securityLogger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RATE_LIMITS.API_GENERAL);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: getSecurityHeaders() }
    );
  }

  // Log access
  securityLogger.logApiAccess(ip, '/api/your-endpoint', 'POST');
  
  // Your API logic here...
}
```

### 2. **Thêm validation cho input**
```typescript
import { z } from 'zod';

const MySchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/)
});

const validation = validateRequestBody(MySchema, body);
```

### 3. **Sử dụng API versioning**
```typescript
import { createVersionedResponse } from '@/lib/api-versioning';

return createVersionedResponse({
  data: yourData,
  success: true
}, 'v2');
```

## 📊 Monitoring

### Development
```bash
# Logs xuất hiện trong console với format dễ đọc
[2024-01-20T10:30:00.000Z] WARN: Security Event: RATE_LIMIT_EXCEEDED from IP 192.168.1.1
```

### Production
```bash
# Logs ở format JSON để integration với logging services
{"timestamp":"2024-01-20T10:30:00.000Z","level":"WARN","message":"Security Event..."}
```

### Alerts
- **Rate limit exceeded**: Cảnh báo khi IP vượt giới hạn
- **Validation failed**: Log chi tiết lỗi validation
- **Suspicious activity**: Phát hiện bot hoặc request bất thường
- **Order creation**: Theo dõi tạo đơn hàng thành công

## 🚀 Production Setup

### 1. **Redis Rate Limiting**
```bash
npm install @upstash/redis @upstash/ratelimit
```

### 2. **Logging Service Integration**
```typescript
// Thay thế console.log bằng service thực tế
// Examples: DataDog, LogRocket, Sentry
```

### 3. **Environment Variables**
```bash
# Production .env
NEXT_PUBLIC_SUPABASE_URL=https://your-production-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
NODE_ENV=production
```

## ⚠️ Lưu ý quan trọng

1. **Không hardcode secrets** trong source code
2. **Luôn validate input** trước khi xử lý
3. **Monitor logs thường xuyên** để phát hiện anomaly
4. **Update dependencies** định kỳ để patch security vulnerabilities
5. **Test rate limiting** trước khi deploy
6. **Backup database** trước mỗi lần deploy major update

## 🔍 Troubleshooting

### Rate Limit Issues
```typescript
// Tăng limit cho specific endpoint
const customConfig = { interval: 60000, uniqueTokenPerInterval: 1000 };
await rateLimit(request, customConfig);
```

### Validation Errors
```typescript
// Debug validation errors
console.log('Validation errors:', validation.errors);
```

### CSP Violations
```typescript
// Điều chỉnh CSP trong middleware.ts
"script-src 'self' 'unsafe-inline' your-trusted-domain.com"
```

## 📞 Support
Nếu gặp vấn đề về bảo mật, vui lòng liên hệ team development để được hỗ trợ nhanh chóng. 