-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  image_square_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add some sample categories
INSERT INTO categories (name, slug, description) VALUES
  ('Ghế Công Thái Học', 'ghe-cong-thai-hoc', 'Các loại ghế được thiết kế theo nguyên lý công thái học'),
  ('Bàn Làm Việc', 'ban-lam-viec', 'Bàn làm việc chuyên nghiệp'),
  ('Phụ Kiện Công Thái Học', 'phu-kien-cong-thai-hoc', 'Các phụ kiện hỗ trợ công thái học')
ON CONFLICT (slug) DO NOTHING; 