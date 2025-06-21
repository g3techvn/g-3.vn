-- Create web_vitals_metrics table for storing performance data
-- Run this in Supabase SQL Editor or your PostgreSQL database

CREATE TABLE IF NOT EXISTS web_vitals_metrics (
  id BIGSERIAL PRIMARY KEY,
  
  -- Core metric data
  metric_name VARCHAR(50) NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  rating VARCHAR(20) NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  
  -- Request context
  url TEXT NOT NULL,
  pathname VARCHAR(500),
  user_agent TEXT,
  ip_address INET,
  
  -- Device/Browser info
  device_type VARCHAR(20), -- mobile, desktop, tablet
  browser_name VARCHAR(50),
  browser_version VARCHAR(20),
  screen_resolution VARCHAR(20),
  connection_type VARCHAR(20),
  device_memory INTEGER,
  
  -- Performance context
  navigation_type VARCHAR(20), -- navigate, reload, back_forward
  page_load_time INTEGER, -- in milliseconds
  dom_content_loaded INTEGER,
  first_paint INTEGER,
  
  -- Additional metrics
  delta NUMERIC(10,2),
  entries JSONB, -- Store performance entries if needed
  
  -- User context (optional)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT valid_metric_name CHECK (
    metric_name IN ('LCP', 'FCP', 'CLS', 'TTFB', 'INP', 'SLOW_RESOURCE', 'LONG_TASK', 'PAGE_HIDDEN')
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON web_vitals_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_web_vitals_url ON web_vitals_metrics(url);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON web_vitals_metrics(rating);
CREATE INDEX IF NOT EXISTS idx_web_vitals_pathname ON web_vitals_metrics(pathname);
CREATE INDEX IF NOT EXISTS idx_web_vitals_user_id ON web_vitals_metrics(user_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_date ON web_vitals_metrics(metric_name, created_at);
CREATE INDEX IF NOT EXISTS idx_web_vitals_url_date ON web_vitals_metrics(pathname, created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE web_vitals_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (adjust based on your auth setup)
CREATE POLICY "Admin can view all web vitals" ON web_vitals_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policy for inserting metrics (allow all for performance tracking)
CREATE POLICY "Anyone can insert web vitals" ON web_vitals_metrics
  FOR INSERT WITH CHECK (true);

-- Create a view for easy analytics
CREATE OR REPLACE VIEW web_vitals_summary AS
SELECT 
  metric_name,
  COUNT(*) as total_measurements,
  AVG(value) as avg_value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75,
  PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY value) as p90,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) as p99,
  COUNT(CASE WHEN rating = 'good' THEN 1 END) as good_count,
  COUNT(CASE WHEN rating = 'needs-improvement' THEN 1 END) as needs_improvement_count,
  COUNT(CASE WHEN rating = 'poor' THEN 1 END) as poor_count,
  MIN(created_at) as first_measurement,
  MAX(created_at) as last_measurement
FROM web_vitals_metrics 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY metric_name;

-- Create a function to clean old data (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_web_vitals()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM web_vitals_metrics 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily (if you have pg_cron extension)
-- SELECT cron.schedule('cleanup-web-vitals', '0 2 * * *', 'SELECT cleanup_old_web_vitals();');

COMMENT ON TABLE web_vitals_metrics IS 'Stores Core Web Vitals and custom performance metrics for monitoring';
COMMENT ON COLUMN web_vitals_metrics.metric_name IS 'Type of metric: LCP, FCP, CLS, TTFB, INP, etc.';
COMMENT ON COLUMN web_vitals_metrics.value IS 'Metric value in milliseconds or score';
COMMENT ON COLUMN web_vitals_metrics.rating IS 'Performance rating: good, needs-improvement, poor';
COMMENT ON VIEW web_vitals_summary IS 'Aggregated view of web vitals metrics for the last 30 days'; 