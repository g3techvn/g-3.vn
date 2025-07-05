**Ghi chú chi tiết các bảng cơ sở dữ liệu Supabase (schema: public) cho dự án G-3.vn:**

---

### 1. brands
- **Trường:** id (PK), created_at, title, slug, image_url, image_square_url, description, updated_at
- **Quan hệ:**
  - products.brand_id → brands.id

### 2. blog_cats
- **Trường:** id (PK), created_at, title, slug (unique), description, updated_at
- **Quan hệ:**
  - blogs.blog_cat_id → blog_cats.id

### 3. blogs
- **Trường:** id (PK), created_at, title, slug (unique), content, blog_cat_id, thumbnail, updated_at
- **Quan hệ:**
  - blog_cat_id → blog_cats.id

### 4. product_cats
- **Trường:** id (PK), created_at, title, slug, image_url, image_square_url, description, parent_id, updated_at
- **Quan hệ:**
  - products.pd_cat_id → product_cats.id
  - product_cats.parent_id → product_cats.id (self-referencing)

### 5. products
- **Trường:** id (PK), created_at, slug, name, description, price, original_price, image_url, rating, updated_at, brand_id, pd_cat_id, cover_image_url, feature, bestseller, video_url, gallery_url, thong_so_ky_thuat (jsonb), tinh_nang, loi_ich (jsonb), huong_dan, comment (array), content, status, is_featured, is_new, sold_count
- **Quan hệ:**
  - brand_id → brands.id
  - pd_cat_id → product_cats.id
  - product_variants.product_id → products.id
  - order_items.product_id → products.id

### 6. promotion
- **Trường:** id (PK), created_at, title, description, image, youtube_url, slug, start_date, end_date, discount_type, discount_value, updated_at

### 7. product_variants
- **Trường:** id (PK), product_id, color, size, weight, length, width, height, price, original_price, image_url, gallery_url (array), sku, stock_quantity, is_default, is_dropship, gac_chan, created_at, updated_at
- **Quan hệ:**
  - product_id → products.id
  - order_items.variant_id → product_variants.id

### 8. orders
- **Trường:** id (PK), user_id, status, total_amount, shipping_address_id, payment_method_id, shipping_carrier_id, tracking_number, notes, created_at, updated_at
- **Quan hệ:**
  - user_id → auth.users.id
  - reward_transactions.related_order_id → orders.id
  - voucher_usages.order_id → orders.id
  - order_items.order_id → orders.id

### 9. order_items
- **Trường:** id (PK), order_id, product_id, variant_id, quantity, price, created_at
- **Quan hệ:**
  - order_id → orders.id
  - product_id → products.id
  - variant_id → product_variants.id

### 10. user_profiles
- **Trường:** id (PK), user_id (unique), email, full_name, phone, avatar_url, address, date_of_birth, gender, created_at, updated_at, role (customer/staff/admin)
- **Quan hệ:**
  - user_id → auth.users.id

### 11. user_rewards
- **Trường:** id (PK), user_id, points, created_at, updated_at
- **Quan hệ:**
  - user_id → auth.users.id

### 12. provinces
- **Trường:** id (PK), code (unique), name, codename, division_type, phone_code, created_at, updated_at
- **Quan hệ:**
  - shipping_addresses.province_code → provinces.code

### 13. districts
- **Trường:** id (PK), code (unique), name, codename, division_type, short_codename, province_code, created_at, updated_at
- **Quan hệ:**
  - shipping_addresses.district_code → districts.code

### 14. wards
- **Trường:** id (PK), code (unique), name, codename, division_type, short_codename, district_code, created_at, updated_at
- **Quan hệ:**
  - shipping_addresses.ward_code → wards.code

### 15. shipping_addresses
- **Trường:** id (PK), user_id, full_name, phone, province_code, district_code, ward_code, address_detail, is_default, created_at, updated_at
- **Quan hệ:**
  - user_id → auth.users.id
  - province_code → provinces.code
  - district_code → districts.code
  - ward_code → wards.code

### 16. payment_methods
- **Trường:** id (PK), name, code (unique), description, is_active, sort_order, created_at, updated_at

### 17. shipping_carriers
- **Trường:** id (PK), name, code (unique), description, is_active, created_at, updated_at

### 18. vouchers
- **Trường:** id (PK), code (unique), description, discount_type, discount_value, min_order_value, max_discount, valid_from, valid_to, usage_limit, is_active, created_at, updated_at
- **Quan hệ:**
  - voucher_usages.voucher_id → vouchers.id

### 19. voucher_usages
- **Trường:** id (PK), voucher_id, user_id, order_id, used_at
- **Quan hệ:**
  - voucher_id → vouchers.id
  - user_id → auth.users.id
  - order_id → orders.id

### 20. reward_transactions
- **Trường:** id (PK), user_id, type (earn/redeem), points, reason, related_order_id, created_at
- **Quan hệ:**
  - user_id → auth.users.id
  - related_order_id → orders.id

---

**English summary:**
- Each table is listed with its fields and relationships (foreign keys). This structure supports a full e-commerce, reward, and content system for G-3.vn.