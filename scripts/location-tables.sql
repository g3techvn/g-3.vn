-- ============================================================================
-- LOCATION TABLES FOR G3-TECH E-COMMERCE
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

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

-- Indexes for provinces
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for districts
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for wards
CREATE INDEX IF NOT EXISTS idx_wards_code ON wards(code);
CREATE INDEX IF NOT EXISTS idx_wards_district_code ON wards(district_code);
CREATE INDEX IF NOT EXISTS idx_wards_name ON wards(name);

-- 4. METADATA TABLE (Optional)
CREATE TABLE IF NOT EXISTS location_metadata (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(100) UNIQUE NOT NULL DEFAULT 'g3_location_data',
  version VARCHAR(50) NOT NULL DEFAULT '1.0',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_provinces INTEGER DEFAULT 0,
  total_districts INTEGER DEFAULT 0,
  total_wards INTEGER DEFAULT 0,
  api_source VARCHAR(255) DEFAULT 'provinces.open-api.vn',
  notes TEXT
);

-- Insert initial metadata
INSERT INTO location_metadata (cache_key, version, notes) 
VALUES ('g3_location_data', '1.0', 'Location data from provinces.open-api.vn')
ON CONFLICT (cache_key) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE provinces IS 'Vietnam provinces/cities from provinces.open-api.vn';
COMMENT ON TABLE districts IS 'Vietnam districts/counties linked to provinces';
COMMENT ON TABLE wards IS 'Vietnam wards/communes linked to districts';
COMMENT ON TABLE location_metadata IS 'Metadata about location data sync status';

-- ============================================================================
-- OPTIONAL: ROW LEVEL SECURITY (Enable if needed)
-- ============================================================================
-- ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wards ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow read access to provinces" ON provinces FOR SELECT USING (true);
-- CREATE POLICY "Allow read access to districts" ON districts FOR SELECT USING (true);
-- CREATE POLICY "Allow read access to wards" ON wards FOR SELECT USING (true); 