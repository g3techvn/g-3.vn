**Ghi chú tổng quan các bảng cơ sở dữ liệu Supabase (schema: public) cho dự án G-3.vn:**

1. **brands**: Quản lý thương hiệu sản phẩm (id, title, slug, image, description...)
2. **blog_cats**: Danh mục blog (id, title, slug, description...)
3. **blogs**: Bài viết blog (id, title, slug, content, blog_cat_id, thumbnail...)
4. **product_cats**: Danh mục sản phẩm (id, title, slug, image, parent_id...)
5. **products**: Sản phẩm (id, name, price, brand_id, pd_cat_id, sold_count, feature, content...)
6. **promotion**: Chương trình khuyến mãi (id, title, description, image, discount...)
7. **product_variants**: Biến thể sản phẩm (id, product_id, color, size, price, stock_quantity...)
8. **orders**: Đơn hàng (id, user_id, status, total_amount, shipping_address_id, payment_method_id...)
9. **order_items**: Sản phẩm trong đơn hàng (id, order_id, product_id, variant_id, quantity, price...)
10. **user_profiles**: Hồ sơ người dùng (id, user_id, email, full_name, phone, avatar_url, role...)
11. **user_rewards**: Điểm thưởng người dùng (id, user_id, points...)
12. **provinces/districts/wards**: Dữ liệu địa lý Việt Nam (id, code, name, codename, division_type...)
13. **shipping_addresses**: Địa chỉ giao hàng (id, user_id, full_name, phone, province_code, district_code, ward_code, address_detail...)
14. **payment_methods**: Phương thức thanh toán (id, name, code, description, is_active...)
15. **shipping_carriers**: Đơn vị vận chuyển (id, name, code, description, is_active...)
16. **vouchers**: Mã giảm giá (id, code, description, discount_type, discount_value, valid_from, valid_to, usage_limit...)
17. **voucher_usages**: Lịch sử sử dụng voucher (id, voucher_id, user_id, order_id, used_at...)
18. **reward_transactions**: Lịch sử giao dịch điểm thưởng (id, user_id, type, points, reason, related_order_id...)

**English summary:**
- The Supabase database for G-3.vn contains tables for brands, products, product categories, product variants, orders, order items, user profiles, user rewards, Vietnamese location data (provinces, districts, wards), shipping addresses, payment methods, shipping carriers, vouchers, voucher usages, reward transactions, blog categories, and blogs. Each table is designed to support a full-featured e-commerce platform with reward and content systems.