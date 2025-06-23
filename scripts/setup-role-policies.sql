-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."orders";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."orders";
DROP POLICY IF EXISTS "Enable update access for users' own orders" ON "public"."orders";

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."order_items";
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON "public"."order_items";

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "Enable insert access for users' own addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "Enable update access for users' own addresses" ON "public"."shipping_addresses";
DROP POLICY IF EXISTS "Enable delete access for users' own addresses" ON "public"."shipping_addresses";

-- Orders policies
CREATE POLICY "Enable admin full access" ON "public"."orders"
FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Enable sale read and update access" ON "public"."orders"
FOR SELECT USING (auth.jwt()->>'role' = 'sale');

CREATE POLICY "Enable sale update access" ON "public"."orders"
FOR UPDATE USING (auth.jwt()->>'role' = 'sale');

CREATE POLICY "Enable customer read own orders" ON "public"."orders"
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable customer create orders" ON "public"."orders"
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Enable admin full access" ON "public"."order_items"
FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Enable sale read access" ON "public"."order_items"
FOR SELECT USING (auth.jwt()->>'role' = 'sale');

CREATE POLICY "Enable customer read own items" ON "public"."order_items"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Enable customer create items" ON "public"."order_items"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Shipping addresses policies
CREATE POLICY "Enable admin full access" ON "public"."shipping_addresses"
FOR ALL USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Enable sale read access" ON "public"."shipping_addresses"
FOR SELECT USING (auth.jwt()->>'role' = 'sale');

CREATE POLICY "Enable customer read own addresses" ON "public"."shipping_addresses"
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable customer manage own addresses" ON "public"."shipping_addresses"
FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."shipping_addresses" ENABLE ROW LEVEL SECURITY; 