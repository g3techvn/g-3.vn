# 🛠️ MANUAL SETUP INSTRUCTIONS FOR SOLD COUNT OPTIMIZATION

## 📋 **Quick Start (Since Environment Variables Not Available)**

### **Step 1: Execute SQL Migration in Supabase Dashboard**

1. **Mở Supabase Dashboard** 
   - Đi tới project của bạn
   - Chọn **SQL Editor**

2. **Copy và chạy SQL từ file** `scripts/add-sold-count-column.sql`
   ```sql
   -- Copy toàn bộ nội dung file add-sold-count-column.sql và paste vào SQL Editor
   -- Hoặc chạy từng section:
   ```

3. **Chạy từng bước:**

#### **Section 1: Add Column & Index**
```sql
-- 1. Add sold_count column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_sold_count ON products(sold_count DESC);
```

#### **Section 2: Create Functions**
```sql
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
```

#### **Section 3: Create Triggers**
```sql
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
```

#### **Section 4: Initial Data Population**
```sql
-- 10. Initial population of sold_count data
SELECT update_all_sold_counts() as initial_update_count;

-- 11. Create index on order_items for trigger performance
CREATE INDEX IF NOT EXISTS idx_order_items_product_order 
ON order_items(product_id, order_id);

-- 12. Create partial index on orders for relevant statuses
CREATE INDEX IF NOT EXISTS idx_orders_relevant_status 
ON orders(status) 
WHERE status IN ('delivered', 'completed', 'processing', 'pending');
```

### **Step 2: Verify Installation**

Chạy query này để kiểm tra:
```sql
-- Check if column exists and has data
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN sold_count > 0 THEN 1 END) as products_with_sales,
  AVG(sold_count) as avg_sold_count,
  MAX(sold_count) as max_sold_count
FROM products 
WHERE status = true;

-- Check sample data
SELECT id, name, sold_count 
FROM products 
WHERE status = true 
ORDER BY sold_count DESC 
LIMIT 10;
```

### **Step 3: Test New API Endpoint**

Sau khi SQL migration xong, start development server:

```bash
npm run dev
# or
yarn dev
```

Test API mới:
```bash
curl "http://localhost:3000/api/products/sold-counts-optimized?product_ids=1,2,3"
```

---

## 📊 **Expected Results After Setup**

1. **New Column:** `products.sold_count` được tạo
2. **Functions:** 3 stored procedures được tạo  
3. **Triggers:** 2 triggers auto-update sold_count
4. **Indexes:** Performance indexes được tạo
5. **Data:** Sold count data được populate

---

## 🧪 **Testing Commands**

```sql
-- Test function manually
SELECT update_product_sold_count(1); -- Update product ID 1

-- Test calculation function
SELECT calculate_product_sold_count(1); -- Calculate for product ID 1

-- View trigger status
SELECT 
  trigger_name, 
  event_manipulation, 
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%sold_count%';
```

---

## 🚨 **Troubleshooting**

### **Issue: Functions not created**
```sql
-- Check function exists
SELECT proname FROM pg_proc WHERE proname LIKE '%sold_count%';
```

### **Issue: Triggers not working**
```sql
-- Check triggers exist
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE '%sold_count%';
```

### **Issue: Permission error**
- Đảm bảo user có quyền CREATE FUNCTION
- Có thể cần sử dụng service role key

---

## ✅ **Success Indicators**

- ✅ Column `sold_count` exists in `products` table
- ✅ Functions return correct values
- ✅ Triggers auto-update when orders change
- ✅ API endpoint `/api/products/sold-counts-optimized` works
- ✅ Performance improvement visible (10x faster queries) 