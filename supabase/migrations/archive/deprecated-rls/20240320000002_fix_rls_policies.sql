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

-- Create policies for orders
CREATE POLICY "admin_all_orders" ON "public"."orders"
FOR ALL TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "sale_read_orders" ON "public"."orders"
FOR SELECT TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'sale');

CREATE POLICY "sale_update_orders" ON "public"."orders"
FOR UPDATE TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'sale');

CREATE POLICY "customer_read_own_orders" ON "public"."orders"
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "customer_create_orders" ON "public"."orders"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policies for order_items
CREATE POLICY "admin_all_order_items" ON "public"."order_items"
FOR ALL TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "sale_read_order_items" ON "public"."order_items"
FOR SELECT TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'sale');

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

-- Create policies for shipping_addresses
CREATE POLICY "admin_all_addresses" ON "public"."shipping_addresses"
FOR ALL TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "sale_read_addresses" ON "public"."shipping_addresses"
FOR SELECT TO authenticated
USING ((auth.jwt()->'app_metadata'->>'role') = 'sale');

CREATE POLICY "customer_read_own_addresses" ON "public"."shipping_addresses"
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "customer_manage_own_addresses" ON "public"."shipping_addresses"
FOR ALL TO authenticated
USING (auth.uid() = user_id); 