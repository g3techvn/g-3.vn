-- RPC function to optimize categories API performance
-- This function reduces multiple queries to a single optimized query

CREATE OR REPLACE FUNCTION get_categories_with_product_count(input_sector_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  slug VARCHAR,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  product_count BIGINT
) 
LANGUAGE SQL
AS $$
  SELECT 
    pc.id,
    pc.title,
    pc.slug,
    pc.description,
    pc.image_url,
    pc.created_at,
    pc.updated_at,
    COUNT(p.id) as product_count
  FROM product_cats pc
  INNER JOIN products p ON p.pd_cat_id = pc.id
  INNER JOIN product_sectors ps ON ps.product_id = p.id
  WHERE ps.sector_id = input_sector_id 
    AND p.status = true
  GROUP BY pc.id, pc.title, pc.slug, pc.description, pc.image_url, pc.created_at, pc.updated_at
  HAVING COUNT(p.id) > 0
  ORDER BY product_count DESC;
$$;

-- Add index for better performance if not exists
CREATE INDEX IF NOT EXISTS idx_product_sectors_sector_id ON product_sectors(sector_id);
CREATE INDEX IF NOT EXISTS idx_products_pd_cat_id ON products(pd_cat_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Composite index for optimal query performance
CREATE INDEX IF NOT EXISTS idx_product_sectors_performance 
ON product_sectors(sector_id, product_id);

CREATE INDEX IF NOT EXISTS idx_products_category_status 
ON products(pd_cat_id, status) 
WHERE status = true; 