-- Drop existing policies
DROP POLICY IF EXISTS "admin_all_orders" ON "public"."orders";
DROP POLICY IF EXISTS "sale_read_orders" ON "public"."orders";
DROP POLICY IF EXISTS "sale_update_orders" ON "public"."orders";
DROP POLICY IF EXISTS "customer_read_own_orders" ON "public"."orders";
DROP POLICY IF EXISTS "customer_create_orders" ON "public"."orders";

DROP POLICY IF EXISTS "admin_all_order_items" ON "public"."order_items";
DROP POLICY IF EXISTS "sale_read_order_items" ON "public"."order_items";
DROP POLICY IF EXISTS "customer_read_own_items" ON "public"."order_items";
DROP POLICY IF EXISTS "customer_create_items" ON "public"."order_items";

DROP POLICY IF EXISTS "admin_all_addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "sale_read_addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "customer_read_own_addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "customer_manage_own_addresses" ON "public"."shipping_addresses";

-- Create default policies for orders
CREATE POLICY "default_orders_policy" ON "public"."orders"
FOR ALL TO authenticated
USING (
  CASE 
    WHEN auth.jwt()->'app_metadata'->>'role' = 'admin' THEN true
    WHEN auth.jwt()->'app_metadata'->>'role' = 'sale' AND (current_setting('request.method') = 'GET' OR current_setting('request.method') = 'PUT') THEN true
    ELSE auth.uid() = user_id
  END
)
WITH CHECK (
  CASE 
    WHEN auth.jwt()->'app_metadata'->>'role' = 'admin' THEN true
    WHEN auth.jwt()->'app_metadata'->>'role' = 'sale' AND current_setting('request.method') = 'PUT' THEN true
    ELSE auth.uid() = user_id
  END
);

-- Create default policies for order_items
CREATE POLICY "default_order_items_policy" ON "public"."order_items"
FOR ALL TO authenticated
USING (
  CASE 
    WHEN auth.jwt()->'app_metadata'->>'role' = 'admin' THEN true
    WHEN auth.jwt()->'app_metadata'->>'role' = 'sale' AND current_setting('request.method') = 'GET' THEN true
    ELSE EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  END
)
WITH CHECK (
  CASE 
    WHEN auth.jwt()->'app_metadata'->>'role' = 'admin' THEN true
    ELSE EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  END
);

-- Create default policies for shipping_addresses
CREATE POLICY "default_shipping_addresses_policy" ON "public"."shipping_addresses"
FOR ALL TO authenticated
USING (
  CASE 
    WHEN auth.jwt()->'app_metadata'->>'role' = 'admin' THEN true
    WHEN auth.jwt()->'app_metadata'->>'role' = 'sale' AND current_setting('request.method') = 'GET' THEN true
    ELSE auth.uid() = user_id
  END
)
WITH CHECK (
  CASE 
    WHEN auth.jwt()->'app_metadata'->>'role' = 'admin' THEN true
    ELSE auth.uid() = user_id
  END
); 