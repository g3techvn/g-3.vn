# 🧹 PHÂN TÍCH VÀ DỌN DẸP SCRIPTS

## 📊 TỔNG QUAN HIỆN TẠI

Thư mục `scripts/` hiện có **33 files** và **4 thư mục con**, cần được dọn dẹp để giữ lại những thành phần cần thiết.

## 🚨 CÁC FILE CẦN XÓA NGAY

### 1. File Trống/Không Hoàn Thiện
- [ ] `apply-migrations.js` - **FILE TRỐNG** (chỉ có 1 dòng trống)

### 2. File Test/Development Không Cần Thiết
- [ ] `test-fallback.js` - Test Redis fallback (có thể di chuyển vào test suite)
- [ ] `test-lazy-loading-performance.js` - Test performance (di chuyển vào test suite)
- [ ] `test-provinces-api.js` - Test API tỉnh thành (di chuyển vào test suite)
- [ ] `test-checkout.js` - Test checkout functionality (di chuyển vào test suite)
- [ ] `test-role-permissions.js` - Test permissions (di chuyển vào test suite)
- [ ] `test-sold-count-consistency.js` - Test sold count (di chuyển vào test suite)

### 3. File Setup Một Lần (Đã Chạy Xong)
- [ ] `setup-location-database.js` - Đã setup location data
- [ ] `sync-location-data.js` - Đã sync xong
- [ ] `sync-remaining-wards.js` - Đã sync xong
- [ ] `create-location-tables-simple.js` - Đã tạo tables
- [ ] `setup-location-data.js` - Đã setup data
- [ ] `setup-test-users.js` - Setup test users (chỉ cần khi dev)
- [ ] `setup-redis.js` - Setup Redis (chỉ cần khi setup môi trường mới)

## ✅ CÁC FILE NÊN GIỮ LẠI

### 1. Scripts Core/Production
- [x] `check-database.js` - **QUAN TRỌNG** - Kiểm tra database structure
- [x] `check-table-structure.js` - **QUAN TRỌNG** - Verify database integrity

### 2. Database Migration Files
- [x] `add-sold-count-column.sql` - **QUAN TRỌNG** - Production migration
- [x] `optimize-categories-rpc.sql` - **QUAN TRỌNG** - Database optimization
- [x] `create-web-vitals-table.sql` - **QUAN TRỌNG** - Analytics table
- [x] `location-tables.sql` - **QUAN TRỌNG** - Location data structure
- [x] `create-location-tables.sql` - **QUAN TRỌNG** - Location tables
- [x] `ensure-user-profiles-table.sql` - **QUAN TRỌNG** - User profiles
- [x] `setup-role-policies.sql` - **QUAN TRỌNG** - Security policies
- [x] `setup-checkout-database.sql` - **QUAN TRỌNG** - Checkout system

### 3. Setup Scripts (Cần Thiết Cho Deploy)
- [x] `setup-checkout.js` - **QUAN TRỌNG** - Checkout system setup
- [x] `migrate-to-sold-count-optimization.js` - **QUAN TRỌNG** - Performance migration
- [x] `disable-orders-rls.js` - **CẦN THIẾT** - Security management
- [x] `update-user-roles.js` - **CẦN THIẾT** - User management

### 4. Monitoring & Performance
- [x] `cpu-performance-monitor.js` - **QUAN TRỌNG** - System monitoring
- [x] `domain-optimization-test.js` - **QUAN TRỌNG** - Performance testing

### 5. Documentation
- [x] `manual-setup-instructions.md` - **QUAN TRỌNG** - Setup guide

### 6. Thư Mục Con Cần Thiết
- [x] `security/` - **QUAN TRỌNG** - Security scripts
- [x] `seo/` - **QUAN TRỌNG** - SEO optimization
- [x] `optimization/` - **QUAN TRỌNG** - Performance optimization
- [x] `build/` - **CẦN THIẾT** - Build tools

## 🎯 KHUYẾN NGHỊ DỌN DẸP

### PHASE 1: Xóa File Trống/Không Hoàn Thiện
```bash
rm scripts/apply-migrations.js
```

### PHASE 2: Di Chuyển Test Files
```bash
mkdir -p tests/scripts
mv scripts/test-*.js tests/scripts/
```

### PHASE 3: Archive Setup Files (Đã Chạy Xong)
```bash
mkdir -p scripts/archive/location-setup
mv scripts/setup-location-* scripts/archive/location-setup/
mv scripts/sync-* scripts/archive/location-setup/
mv scripts/create-location-tables-simple.js scripts/archive/location-setup/
mv scripts/setup-location-data.js scripts/archive/location-setup/
```

### PHASE 4: Archive One-Time Scripts
```bash
mkdir -p scripts/archive/setup
mv scripts/setup-test-users.js scripts/archive/setup/
mv scripts/setup-redis.js scripts/archive/setup/
```

## 📈 KẾT QUÄ SAU DỌN DẸP

### TRƯỚC: 33 files + 4 folders
### SAU: 18 files + 6 folders (bao gồm archive)

### Cấu Trúc Mới:
```
scripts/
├── archive/           # Files đã sử dụng
├── security/          # Security scripts
├── seo/              # SEO scripts  
├── optimization/     # Performance scripts
├── build/           # Build tools
├── *.sql            # Database migrations (CORE)
├── check-*.js       # Database verification (CORE)
├── setup-checkout.js # Checkout setup (CORE)
├── cpu-performance-monitor.js # Monitoring (CORE)
├── domain-optimization-test.js # Performance (CORE)
└── manual-setup-instructions.md # Documentation (CORE)
```

## ⚡ ACTIONS TO TAKE

1. **Backup trước khi xóa**: `tar -czf scripts-backup-$(date +%Y%m%d).tar.gz scripts/`
2. **Thực hiện từng phase** theo thứ tự trên
3. **Test lại** các chức năng sau khi dọn dẹp
4. **Update documentation** nếu cần

## 🎊 LỢI ÍCH

- ✅ Giảm confusion cho developers
- ✅ Dễ maintain và tìm kiếm
- ✅ Rõ ràng files nào đang được sử dụng
- ✅ Archive files quan trọng cho sau này
- ✅ Cải thiện organization của project 