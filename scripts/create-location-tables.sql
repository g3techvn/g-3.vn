-- ============================================================================
-- LOCATION MANAGEMENT TABLES FOR G3-TECH E-COMMERCE
-- ============================================================================
-- These tables store provinces, districts, and wards data from API
-- Replaces localStorage with database storage for better sync and backup

-- 1. PROVINCES TABLE
CREATE TABLE IF NOT EXISTS provinces (
  id SERIAL PRIMARY KEY,
  code INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  codename VARCHAR(255),
  division_type VARCHAR(100),
  phone_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_provinces_code ON provinces(code);
CREATE INDEX IF NOT EXISTS idx_provinces_name ON provinces(name);

-- 2. DISTRICTS TABLE  
CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  code INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  codename VARCHAR(255),
  division_type VARCHAR(100),
  short_codename VARCHAR(100),
  province_code INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to provinces
  CONSTRAINT fk_districts_province 
    FOREIGN KEY (province_code) 
    REFERENCES provinces(code) 
    ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_districts_code ON districts(code);
CREATE INDEX IF NOT EXISTS idx_districts_province_code ON districts(province_code);
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);

-- 3. WARDS TABLE
CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  code INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  codename VARCHAR(255),
  division_type VARCHAR(100),
  short_codename VARCHAR(100),
  district_code INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to districts
  CONSTRAINT fk_wards_district 
    FOREIGN KEY (district_code) 
    REFERENCES districts(code) 
    ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wards_code ON wards(code);
CREATE INDEX IF NOT EXISTS idx_wards_district_code ON wards(district_code);
CREATE INDEX IF NOT EXISTS idx_wards_name ON wards(name);

-- 4. LOCATION CACHE METADATA
CREATE TABLE IF NOT EXISTS location_cache_metadata (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(100) UNIQUE NOT NULL DEFAULT 'g3_location_data',
  version VARCHAR(50) NOT NULL DEFAULT '1.0',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_provinces INTEGER DEFAULT 0,
  total_districts INTEGER DEFAULT 0,
  total_wards INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE,
  api_source VARCHAR(255) DEFAULT 'provinces.open-api.vn',
  notes TEXT
);

-- Insert initial metadata
INSERT INTO location_cache_metadata (cache_key, version, notes) 
VALUES ('g3_location_data', '1.0', 'Vietnam provinces/districts/wards data from provinces.open-api.vn')
ON CONFLICT (cache_key) DO NOTHING;

-- ============================================================================
-- FUNCTIONS FOR LOCATION MANAGEMENT
-- ============================================================================

-- Function to update cache metadata
CREATE OR REPLACE FUNCTION update_location_cache_stats() 
RETURNS VOID AS $$
BEGIN
  UPDATE location_cache_metadata 
  SET 
    total_provinces = (SELECT COUNT(*) FROM provinces),
    total_districts = (SELECT COUNT(*) FROM districts),
    total_wards = (SELECT COUNT(*) FROM wards),
    last_updated = NOW(),
    is_complete = (
      SELECT COUNT(*) FROM provinces >= 60 AND 
             COUNT(*) FROM districts >= 600 AND
             COUNT(*) FROM wards >= 8000
    )
  WHERE cache_key = 'g3_location_data';
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats when data changes
CREATE OR REPLACE FUNCTION trigger_update_location_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_location_cache_stats();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS tr_provinces_stats ON provinces;
CREATE TRIGGER tr_provinces_stats
  AFTER INSERT OR UPDATE OR DELETE ON provinces
  FOR EACH STATEMENT EXECUTE FUNCTION trigger_update_location_stats();

DROP TRIGGER IF EXISTS tr_districts_stats ON districts;
CREATE TRIGGER tr_districts_stats
  AFTER INSERT OR UPDATE OR DELETE ON districts
  FOR EACH STATEMENT EXECUTE FUNCTION trigger_update_location_stats();

DROP TRIGGER IF EXISTS tr_wards_stats ON wards;
CREATE TRIGGER tr_wards_stats
  AFTER INSERT OR UPDATE OR DELETE ON wards
  FOR EACH STATEMENT EXECUTE FUNCTION trigger_update_location_stats();

-- ============================================================================
-- VIEWS FOR EASIER QUERIES
-- ============================================================================

-- Complete location view with province, district, ward hierarchy
CREATE OR REPLACE VIEW vw_complete_locations AS
SELECT 
  w.code as ward_code,
  w.name as ward_name,
  w.division_type as ward_type,
  d.code as district_code,
  d.name as district_name,
  d.division_type as district_type,
  p.code as province_code,
  p.name as province_name,
  p.division_type as province_type,
  CONCAT(w.name, ', ', d.name, ', ', p.name) as full_address
FROM wards w
JOIN districts d ON w.district_code = d.code
JOIN provinces p ON d.province_code = p.code
ORDER BY p.name, d.name, w.name;

-- District summary view
CREATE OR REPLACE VIEW vw_district_summary AS
SELECT 
  d.code,
  d.name,
  d.province_code,
  p.name as province_name,
  COUNT(w.id) as ward_count
FROM districts d
JOIN provinces p ON d.province_code = p.code
LEFT JOIN wards w ON d.code = w.district_code
GROUP BY d.code, d.name, d.province_code, p.name
ORDER BY p.name, d.name;

-- Province summary view
CREATE OR REPLACE VIEW vw_province_summary AS
SELECT 
  p.code,
  p.name,
  COUNT(DISTINCT d.id) as district_count,
  COUNT(w.id) as ward_count
FROM provinces p
LEFT JOIN districts d ON p.code = d.province_code
LEFT JOIN wards w ON d.code = w.district_code
GROUP BY p.code, p.name
ORDER BY p.name;

-- ============================================================================
-- PERMISSIONS (Optional - for production)
-- ============================================================================

-- Allow read access to authenticated users
-- ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wards ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
-- CREATE POLICY "Allow read access to provinces" ON provinces FOR SELECT USING (true);
-- CREATE POLICY "Allow read access to districts" ON districts FOR SELECT USING (true);
-- CREATE POLICY "Allow read access to wards" ON wards FOR SELECT USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE provinces IS 'Vietnam provinces/cities data from provinces.open-api.vn';
COMMENT ON TABLE districts IS 'Vietnam districts/counties data linked to provinces';
COMMENT ON TABLE wards IS 'Vietnam wards/communes data linked to districts';
COMMENT ON TABLE location_cache_metadata IS 'Metadata about location data cache status';

COMMENT ON COLUMN provinces.code IS 'Unique province code from API';
COMMENT ON COLUMN districts.province_code IS 'Reference to parent province';
COMMENT ON COLUMN wards.district_code IS 'Reference to parent district';

-- ============================================================================
-- END OF LOCATION TABLES CREATION
-- ============================================================================ 