# Phân Tích Database Supabase vs Code Features - G3.VN

## Tổng Quan
Document này phân tích database structure hiện tại trên Supabase và so sánh với code để xác định các tính năng còn thiếu hoặc cần bổ sung.

## 1. THÔNG TIN DATABASE HIỆN TẠI

### 1.1 Tables Đã Tạo (qua Migrations)
Từ các migration files và scripts:

#### Core Tables:
- `products` - Sản phẩm ✅
- `product_variants` - Biến thể sản phẩm ✅
- `brands` - Thương hiệu ✅
- `product_cats` (categories) - Danh mục ✅
- `sectors` - Lĩnh vực ✅
- `product_sectors` - Liên kết sản phẩm-lĩnh vực ✅

#### Order Management:
- `orders` - Đơn hàng ✅
- `order_items` - Chi tiết đơn hàng ✅
- `shipping_addresses` - Địa chỉ giao hàng ✅
- `payment_methods` - Phương thức thanh toán ✅
- `shipping_carriers` - Đơn vị vận chuyển ✅

#### User & Auth:
- `auth.users` (Supabase native) ✅
- `user_roles` - Vai trò người dùng ✅
- `user_rewards` - Điểm thưởng người dùng ✅
- `reward_transactions` - Lịch sử giao dịch điểm ✅

#### Location Management:
- `provinces` - Tỉnh/Thành phố ✅
- `districts` - Quận/Huyện ✅
- `wards` - Phường/Xã ✅

#### Other Features:
- `vouchers` - Mã giảm giá ✅
- `web_vitals` - Performance tracking ✅

### 1.2 Advanced Features
- **RLS Policies**: Đã setup đầy đủ cho admin, sale, customer roles
- **Triggers**: Auto-update sold_count cho products
- **Functions**: Validate vouchers, calculate sold counts
- **Indexes**: Optimized cho performance

## 2. PHÂN TÍCH CODE FEATURES

### 2.1 API Endpoints Hiện Có
```
/api/products/* - Quản lý sản phẩm ✅
/api/categories/* - Quản lý danh mục ✅
/api/brands/* - Quản lý thương hiệu ✅
/api/orders/* - Quản lý đơn hàng ✅
/api/user/* - Quản lý người dùng ✅
/api/vouchers/* - Quản lý voucher ✅
/api/payment-methods/* - Phương thức thanh toán ✅
/api/shipping-carriers/* - Đơn vị vận chuyển ✅
/api/web-vitals/* - Performance monitoring ✅
```

### 2.2 Frontend Components
- Authentication system ✅
- Cart management ✅
- Product catalog ✅
- Checkout flow ✅
- User profile & orders ✅
- Reward points system ✅
- Admin dashboard ✅

## 3. CÁC TÍNH NĂNG CÒN THIẾU

### 3.1 Database Tables Thiếu

#### A. Blog/Content Management
```sql
-- THIẾU: Tables cho blog/content
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_post_categories (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
```

#### B. Reviews & Ratings
```sql
-- THIẾU: Hệ thống đánh giá sản phẩm
CREATE TABLE product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- Một user chỉ review một lần/sản phẩm
);

CREATE TABLE review_helpful_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);
```

#### C. Wishlist/Favorites
```sql
-- THIẾU: Danh sách yêu thích
CREATE TABLE user_wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

#### D. Inventory Management
```sql
-- THIẾU: Quản lý kho chi tiết
CREATE TABLE inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  variant_id BIGINT REFERENCES product_variants(id),
  movement_type VARCHAR(20) NOT NULL, -- in, out, adjustment
  quantity INTEGER NOT NULL,
  reason VARCHAR(255),
  reference_id BIGINT, -- order_id nếu là sale
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE stock_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id BIGINT REFERENCES products(id),
  variant_id BIGINT REFERENCES product_variants(id),
  threshold_quantity INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### E. Notifications
```sql
-- THIẾU: Hệ thống thông báo
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- order_status, stock_alert, promotion, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Metadata
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### F. Coupons/Promotions Advanced
```sql
-- THIẾU: Hệ thống khuyến mại nâng cao
CREATE TABLE promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- percentage, fixed_amount, buy_x_get_y
  value DECIMAL(10,2),
  conditions JSONB, -- Điều kiện áp dụng
  applicable_products JSONB, -- Sản phẩm áp dụng
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 API Endpoints Thiếu

```typescript
// THIẾU các API endpoints:
/api/reviews/* - Quản lý đánh giá ❌
/api/wishlist/* - Danh sách yêu thích ❌  
/api/blog/* - Quản lý blog ❌
/api/notifications/* - Thông báo ❌
/api/inventory/* - Quản lý kho ❌
/api/promotions/* - Khuyến mại nâng cao ❌
/api/analytics/* - Thống kê chi tiết ❌
/api/reports/* - Báo cáo ❌
```

### 3.3 Frontend Components Thiếu

#### A. Review System
- Product review form ❌
- Review display & filtering ❌
- Review moderation (admin) ❌

#### B. Wishlist
- Add to wishlist button ❌
- Wishlist page ❌
- Wishlist notifications ❌

#### C. Advanced Search & Filtering
- Full-text search ❌
- Advanced filters (price range, features) ❌
- Search suggestions ❌
- Search analytics ❌

#### D. Notifications
- In-app notification center ❌
- Push notifications ❌
- Email notifications ❌

#### E. Analytics Dashboard
- Sales reports ❌
- Customer analytics ❌
- Product performance ❌
- Revenue tracking ❌

## 4. CÁCH KHẮC PHỤC

### 4.1 Ưu Tiên Cao (Cần làm ngay)

1. **Review System** - Quan trọng cho e-commerce
2. **Wishlist** - Tăng conversion rate
3. **Advanced Search** - Cải thiện UX
4. **Inventory Management** - Quản lý kho tốt hơn

### 4.2 Ưu Tiên Trung Bình

1. **Blog/Content Management** - SEO và marketing
2. **Notifications** - User engagement  
3. **Advanced Promotions** - Marketing tools

### 4.3 Ưu Tiên Thấp

1. **Analytics Dashboard** - Nice to have
2. **Advanced Reports** - Có thể dùng third-party tools

## 5. ACTION ITEMS

### Phase 1: Core E-commerce Features
- [ ] Tạo review system (database + API + UI)
- [ ] Implement wishlist functionality
- [ ] Add advanced search với Supabase full-text search
- [ ] Inventory tracking system

### Phase 2: Content & Marketing
- [ ] Blog management system
- [ ] Advanced promotion engine
- [ ] Email notifications
- [ ] Push notifications

### Phase 3: Analytics & Optimization
- [ ] Analytics dashboard
- [ ] Sales reports
- [ ] A/B testing framework
- [ ] Performance optimization

## 6. NOTES

- Database đã được setup rất tốt với RLS policies
- Code structure sạch và scalable
- Cần focus vào user experience features trước
- Performance monitoring đã có sẵn (web_vitals)
- Security đã được hardening tốt

---
*Cập nhật lần cuối: ${new Date().toLocaleDateString('vi-VN')}* 