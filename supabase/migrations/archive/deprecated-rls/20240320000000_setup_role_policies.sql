-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom roles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sale') THEN
        CREATE ROLE sale;
    END IF;
END
$$;

-- Update RLS policies for orders
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."orders";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."orders";
DROP POLICY IF EXISTS "Enable update access for users' own orders" ON "public"."orders";

CREATE POLICY "admin_all_orders" ON "public"."orders"
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "sale_read_orders" ON "public"."orders"
FOR SELECT TO authenticated
USING (auth.jwt()->>'role' = 'sale');

CREATE POLICY "sale_update_orders" ON "public"."orders"
FOR UPDATE TO authenticated
USING (auth.jwt()->>'role' = 'sale');

CREATE POLICY "customer_read_own_orders" ON "public"."orders"
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "customer_create_orders" ON "public"."orders"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update RLS policies for order_items
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."order_items";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."order_items";

CREATE POLICY "admin_all_order_items" ON "public"."order_items"
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "sale_read_order_items" ON "public"."order_items"
FOR SELECT TO authenticated
USING (auth.jwt()->>'role' = 'sale');

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

-- Update RLS policies for shipping_addresses
ALTER TABLE "public"."shipping_addresses" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "Enable insert access for users' own addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "Enable update access for users' own addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "Enable delete access for users' own addresses" ON "public"."shipping_addresses";

CREATE POLICY "admin_all_addresses" ON "public"."shipping_addresses"
FOR ALL TO authenticated
USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "sale_read_addresses" ON "public"."shipping_addresses"
FOR SELECT TO authenticated
USING (auth.jwt()->>'role' = 'sale');

CREATE POLICY "customer_read_own_addresses" ON "public"."shipping_addresses"
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "customer_manage_own_addresses" ON "public"."shipping_addresses"
FOR ALL TO authenticated
USING (auth.uid() = user_id); 