-- ============================================================================
-- ADD SOLD_COUNT COLUMN TO PRODUCTS TABLE
-- Migration script for G3-TECH E-commerce optimization
-- ============================================================================

-- 1. Add sold_count column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_sold_count ON products(sold_count DESC);

-- 3. Create function to calculate and update sold counts
CREATE OR REPLACE FUNCTION calculate_product_sold_count(product_id_param BIGINT)
RETURNS INTEGER
LANGUAGE SQL
AS $$
  SELECT COALESCE(SUM(oi.quantity), 0)::INTEGER
  FROM order_items oi
  INNER JOIN orders o ON o.id = oi.order_id
  WHERE oi.product_id = product_id_param
    AND o.status IN ('delivered', 'completed', 'processing', 'pending');
$$;

-- 4. Create function to update all sold counts
CREATE OR REPLACE FUNCTION update_all_sold_counts()
RETURNS INTEGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  updated_count INTEGER := 0;
  product_record RECORD;
  new_sold_count INTEGER;
BEGIN
  -- Loop through all products
  FOR product_record IN 
    SELECT id FROM products WHERE status = true
  LOOP
    -- Calculate sold count for this product
    SELECT calculate_product_sold_count(product_record.id::BIGINT) INTO new_sold_count;
    
    -- Update the product's sold_count
    UPDATE products 
    SET sold_count = new_sold_count,
        updated_at = NOW()
    WHERE id = product_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$;

-- 5. Create function to update sold count for specific product
CREATE OR REPLACE FUNCTION update_product_sold_count(product_id_param BIGINT)
RETURNS INTEGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  new_sold_count INTEGER;
BEGIN
  -- Calculate new sold count
  SELECT calculate_product_sold_count(product_id_param) INTO new_sold_count;
  
  -- Update the product
  UPDATE products 
  SET sold_count = new_sold_count,
      updated_at = NOW()
  WHERE id = product_id_param;
  
  RETURN new_sold_count;
END;
$$;

-- 6. Create trigger to auto-update sold count when orders change
CREATE OR REPLACE FUNCTION trigger_update_sold_count()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_product_sold_count(NEW.product_id);
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM update_product_sold_count(OLD.product_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 7. Create trigger on order_items table
DROP TRIGGER IF EXISTS trigger_order_items_sold_count ON order_items;
CREATE TRIGGER trigger_order_items_sold_count
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_sold_count();

-- 8. Create trigger for order status changes
CREATE OR REPLACE FUNCTION trigger_order_status_update()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  -- Only update if status changed to/from relevant statuses
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Update sold counts for all products in this order
    PERFORM update_product_sold_count(oi.product_id)
    FROM order_items oi
    WHERE oi.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 9. Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_orders_status_sold_count ON orders;
CREATE TRIGGER trigger_orders_status_sold_count
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_order_status_update();

-- 10. Initial population of sold_count data
SELECT update_all_sold_counts() as initial_update_count;

-- 11. Create index on order_items for trigger performance
CREATE INDEX IF NOT EXISTS idx_order_items_product_order 
ON order_items(product_id, order_id);

-- 12. Create partial index on orders for relevant statuses
CREATE INDEX IF NOT EXISTS idx_orders_relevant_status 
ON orders(status) 
WHERE status IN ('delivered', 'completed', 'processing', 'pending');

COMMENT ON COLUMN products.sold_count IS 'Cached count of sold items for this product';
COMMENT ON FUNCTION calculate_product_sold_count IS 'Calculate total sold count for a product';
COMMENT ON FUNCTION update_all_sold_counts IS 'Update sold_count for all products';
COMMENT ON FUNCTION update_product_sold_count IS 'Update sold_count for specific product'; 