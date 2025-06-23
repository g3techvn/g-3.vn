# Hướng dẫn Cài đặt Policy

## 1. Truy cập Supabase Dashboard

1. Đăng nhập vào Supabase Dashboard
2. Chọn project của bạn
3. Chọn "Authentication" > "Policies" trong menu bên trái

## 2. Cài đặt Policy cho Orders

### Xóa policy cũ
1. Chọn bảng "orders"
2. Xóa tất cả policy hiện có

### Tạo policy mới
1. Chọn "New Policy"
2. Tạo các policy sau:

#### Admin - Full Access
- Policy name: admin_all_orders
- Target roles: authenticated
- Using expression: `auth.jwt() ->> 'role' = 'admin'`
- Check expression: `auth.jwt() ->> 'role' = 'admin'`

#### Sale - Read & Update
- Policy name: sale_read_orders
- Target roles: authenticated
- Operation: SELECT
- Using expression: `auth.jwt() ->> 'role' = 'sale'`

- Policy name: sale_update_orders
- Target roles: authenticated
- Operation: UPDATE
- Using expression: `auth.jwt() ->> 'role' = 'sale'`

#### Customer - Own Orders
- Policy name: customer_read_own_orders
- Target roles: authenticated
- Operation: SELECT
- Using expression: `auth.uid() = user_id`

- Policy name: customer_create_orders
- Target roles: authenticated
- Operation: INSERT
- Check expression: `auth.uid() = user_id`

## 3. Cài đặt Policy cho Order Items

### Xóa policy cũ
1. Chọn bảng "order_items"
2. Xóa tất cả policy hiện có

### Tạo policy mới

#### Admin - Full Access
- Policy name: admin_all_order_items
- Target roles: authenticated
- Using expression: `auth.jwt() ->> 'role' = 'admin'`
- Check expression: `auth.jwt() ->> 'role' = 'admin'`

#### Sale - Read Only
- Policy name: sale_read_order_items
- Target roles: authenticated
- Operation: SELECT
- Using expression: `auth.jwt() ->> 'role' = 'sale'`

#### Customer - Own Items
- Policy name: customer_read_own_items
- Target roles: authenticated
- Operation: SELECT
- Using expression: `EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())`

- Policy name: customer_create_items
- Target roles: authenticated
- Operation: INSERT
- Check expression: `EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())`

## 4. Cài đặt Policy cho Shipping Addresses

### Xóa policy cũ
1. Chọn bảng "shipping_addresses"
2. Xóa tất cả policy hiện có

### Tạo policy mới

#### Admin - Full Access
- Policy name: admin_all_addresses
- Target roles: authenticated
- Using expression: `auth.jwt() ->> 'role' = 'admin'`
- Check expression: `auth.jwt() ->> 'role' = 'admin'`

#### Sale - Read Only
- Policy name: sale_read_addresses
- Target roles: authenticated
- Operation: SELECT
- Using expression: `auth.jwt() ->> 'role' = 'sale'`

#### Customer - Own Addresses
- Policy name: customer_read_own_addresses
- Target roles: authenticated
- Operation: SELECT
- Using expression: `auth.uid() = user_id`

- Policy name: customer_manage_own_addresses
- Target roles: authenticated
- Using expression: `auth.uid() = user_id`
- Check expression: `auth.uid() = user_id`

## 5. Kiểm tra

Sau khi cài đặt policy, hãy test lại quyền truy cập bằng cách chạy script test:

```bash
node scripts/test-role-permissions.js
```

Nếu có lỗi, hãy kiểm tra lại các policy và đảm bảo chúng được cài đặt đúng. 

## SQL để cài đặt policy

```sql
-- Xóa policy cũ
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."orders";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."orders";
DROP POLICY IF EXISTS "Enable update access for users' own orders" ON "public"."orders";
DROP POLICY IF EXISTS "admin_all_orders" ON "public"."orders";
DROP POLICY IF EXISTS "sale_read_orders" ON "public"."orders";
DROP POLICY IF EXISTS "sale_update_orders" ON "public"."orders";
DROP POLICY IF EXISTS "customer_read_own_orders" ON "public"."orders";
DROP POLICY IF EXISTS "customer_create_orders" ON "public"."orders";

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."order_items";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."order_items";
DROP POLICY IF EXISTS "admin_all_order_items" ON "public"."order_items";
DROP POLICY IF EXISTS "sale_read_order_items" ON "public"."order_items";
DROP POLICY IF EXISTS "customer_read_own_items" ON "public"."order_items";
DROP POLICY IF EXISTS "customer_create_items" ON "public"."order_items";

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "Enable insert access for users' own addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "Enable update access for users' own addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "Enable delete access for users' own addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "admin_all_addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "sale_read_addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "customer_read_own_addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "customer_manage_own_addresses" ON "public"."shipping_addresses";

-- Bật RLS cho các bảng
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shipping_addresses" ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho orders
DROP POLICY IF EXISTS "admin_all_orders" ON "public"."orders";
CREATE POLICY "admin_all_orders" ON "public"."orders"
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin' OR (auth.jwt()->'app_metadata'->>'role')::text = 'admin');

DROP POLICY IF EXISTS "sale_read_orders" ON "public"."orders";
CREATE POLICY "sale_read_orders" ON "public"."orders"
FOR SELECT TO authenticated
USING (auth.jwt()->>'role' = 'sale' OR (auth.jwt()->'app_metadata'->>'role')::text = 'sale');

DROP POLICY IF EXISTS "sale_update_orders" ON "public"."orders";
CREATE POLICY "sale_update_orders" ON "public"."orders"
FOR UPDATE TO authenticated
USING (auth.jwt()->>'role' = 'sale' OR (auth.jwt()->'app_metadata'->>'role')::text = 'sale');

CREATE POLICY "customer_read_own_orders" ON "public"."orders"
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "customer_create_orders" ON "public"."orders"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Tạo policy cho order_items
DROP POLICY IF EXISTS "admin_all_order_items" ON "public"."order_items";
CREATE POLICY "admin_all_order_items" ON "public"."order_items"
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin' OR (auth.jwt()->'app_metadata'->>'role')::text = 'admin');

DROP POLICY IF EXISTS "sale_read_order_items" ON "public"."order_items";
CREATE POLICY "sale_read_order_items" ON "public"."order_items"
FOR SELECT TO authenticated
USING (auth.jwt()->>'role' = 'sale' OR (auth.jwt()->'app_metadata'->>'role')::text = 'sale');

CREATE POLICY "customer_read_own_items" ON "public"."order_items"
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

CREATE POLICY "customer_create_items" ON "public"."order_items"
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Tạo policy cho shipping_addresses
DROP POLICY IF EXISTS "admin_all_addresses" ON "public"."shipping_addresses";
CREATE POLICY "admin_all_addresses" ON "public"."shipping_addresses"
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin' OR (auth.jwt()->'app_metadata'->>'role')::text = 'admin');

DROP POLICY IF EXISTS "sale_read_addresses" ON "public"."shipping_addresses";
CREATE POLICY "sale_read_addresses" ON "public"."shipping_addresses"
FOR SELECT TO authenticated
USING (auth.jwt()->>'role' = 'sale' OR (auth.jwt()->'app_metadata'->>'role')::text = 'sale');

CREATE POLICY "customer_read_own_addresses" ON "public"."shipping_addresses"
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "customer_manage_own_addresses" ON "public"."shipping_addresses"
FOR ALL TO authenticated
USING (auth.uid() = user_id);
``` 