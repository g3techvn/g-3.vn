# 🚀 Cache Management Guide

## Disable Cache trong Development

### 📋 Scripts Available

```bash
# Development bình thường
npm run dev

# Xóa .next cache và khởi động
npm run dev:no-cache

# Xóa tất cả cache và khởi động
npm run dev:fresh

# Chỉ xóa cache
npm run clear-cache

# Reset toàn bộ project (bao gồm cả node_modules install)
npm run reset
```

### ⚙️ Auto Cache Headers

Cache headers tự động disable trong development:
- `Cache-Control: no-store, no-cache, must-revalidate`
- `Pragma: no-cache`  
- `Expires: 0`
- `Surrogate-Control: no-store`

### 🔧 Manual Browser Cache Clear

#### Chrome/Edge:
- **Soft reload**: `Cmd+R` / `Ctrl+R`
- **Hard reload**: `Cmd+Shift+R` / `Ctrl+Shift+R`
- **Empty cache**: DevTools → Network → "Disable cache" checkbox

#### Firefox:
- **Hard reload**: `Cmd+Shift+R` / `Ctrl+Shift+R`
- **Clear cache**: DevTools → Storage → Clear All

### 💡 Tips

1. **Luôn dùng `dev:no-cache`** khi gặp vấn đề cache
2. **Kiểm tra Network tab** trong DevTools để confirm no-cache
3. **Dùng `reset`** khi có vấn đề dependencies
4. **Disable browser cache** trong DevTools khi debug

### 🎯 Production vs Development

- **Development**: No cache (như đã config)
- **Production**: Cache enabled với max-age 31536000 