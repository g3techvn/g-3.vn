# Hướng dẫn tạo bảng Product trong Supabase


SUPABASE_HOST=static.g-3.vn
JWT_SECRET=QUmoitiDxR0+LkGv7HHq2zS1zOSXn/i6CJa9ImO/SI0=
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzQxNTAwMDAwLAogICJleHAiOiAxODk5MjY2NDAwCn0.muKe0Nrvkf5bMyLoFqAuFypRu3jHAcTYU08SYKrgRQo
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3NDE1MDAwMDAsCiAgImV4cCI6IDE4OTkyNjY0MDAKfQ.1KoSiJVueKJNkF59uc84BLqk7h8VdAoVp6Gozqr_vGc

## Cấu trúc bảng Product

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER,
  discount_percentage INTEGER,
  image_url TEXT NOT NULL,
  category_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  brand TEXT,
  rating NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```


```sql
-- Policy cho phép tất cả người dùng đọc dữ liệu
CREATE POLICY "Allow public read access" 
ON products FOR SELECT 
USING (true);

-- Policy cho phép admin thêm dữ liệu
CREATE POLICY "Allow admin insert" 
ON products FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policy cho phép admin cập nhật dữ liệu
CREATE POLICY "Allow admin update" 
ON products FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policy cho phép admin xóa dữ liệu
CREATE POLICY "Allow admin delete" 
ON products FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');
```

### Lệnh SQL tạo dữ liệu mẫu

Bạn có thể sử dụng lệnh SQL để thêm dữ liệu mẫu vào Supabase:

```sql
-- Thêm dữ liệu Gami Products
INSERT INTO products (id, name, description, price, original_price, discount_percentage, image_url, category_id, brand_id, brand, rating, created_at, updated_at)
VALUES 
('gami-core', 'Ghế Gami Core', 'Ghế công thái học Gami Core, thiết kế hiện đại, hỗ trợ tư thế ngồi tối ưu.', 2050000, 2250000, 9, 'https://product.hstatic.net/200000912647/product/1_e71646180bb44ce6bd7b4515caace2ee_large.png', 'ghe-cong-thai-hoc', 'Gami', 'Gami Việt Nam', 4.5, NOW(), NOW()),
('gami-crom-all-black', 'Ghế Gami Crom (Bản All Black)', 'Ghế công thái học Gami Crom phiên bản All Black, thiết kế sang trọng, đẳng cấp.', 5990000, 6390000, 6, 'https://product.hstatic.net/200000912647/product/1_5b197650a67f428b87eeed2ce712480f_large.png', 'ghe-cong-thai-hoc', 'Gami', 'Gami Việt Nam', 5, NOW(), NOW()),
('gami-crom-carbon', 'Ghế Gami Crom (Phiên bản lưng Carbon)', 'Ghế công thái học Gami Crom phiên bản lưng Carbon, nhẹ và chắc chắn, hỗ trợ lưng tối đa.', 6890000, 7290000, 5, 'https://product.hstatic.net/200000912647/product/6_7256181dc0e040518daaaf210464741f_large.png', 'ghe-cong-thai-hoc', 'Gami', 'Gami Việt Nam', 4.8, NOW(), NOW()),
('gami-crom-pro', 'Ghế Gami Crom Pro', 'Ghế công thái học Gami Crom Pro, phiên bản cao cấp nhất, tích hợp nhiều tính năng hiện đại.', 12900000, 13500000, 4, 'https://product.hstatic.net/200000912647/product/crom_pro__1__d1e41a2442e84df1b2d7ae01cdcd883d_large.png', 'ghe-cong-thai-hoc', 'Gami', 'Gami Việt Nam', 5, NOW(), NOW()),
('gami-focus-v1', 'Ghế Gami Focus V1', 'Ghế công thái học Gami Focus V1, thiết kế tập trung vào sự thoải mái và hỗ trợ lưng.', 2690000, 2990000, 10, 'https://product.hstatic.net/200000912647/product/7_ef0717654a27469f993e2556267da3e1_large.png', 'ghe-cong-thai-hoc', 'Gami', 'Gami Việt Nam', 4.3, NOW(), NOW()),
('gami-focus-v2', 'Ghế Gami Focus V2 Full lưới', 'Ghế công thái học Gami Focus V2 Full lưới, thoáng mát và hỗ trợ tối đa tư thế ngồi.', 3590000, 3890000, 8, 'https://product.hstatic.net/200000912647/product/1_7c74b7ffccb54152ad0ac3272f18d5ff_large.png', 'ghe-cong-thai-hoc', 'Gami', 'Gami Việt Nam', 4.6, NOW(), NOW()),
('gami-metic', 'Ghế Gami Metic', 'Ghế công thái học Gami Metic, thiết kế thông minh, hỗ trợ cột sống và giảm mỏi khi ngồi lâu.', 4490000, 4790000, 6, 'https://product.hstatic.net/200000912647/product/1_7c6dda169db045579b693faf7fb8e409_large.png', 'ghe-cong-thai-hoc', 'Gami', 'Gami Việt Nam', 4.7, NOW(), NOW());

-- Thêm dữ liệu ConThaiHoc Products
INSERT INTO products (id, name, description, price, original_price, discount_percentage, image_url, category_id, brand_id, brand, rating, created_at, updated_at)
VALUES
('dvary-butterfly', 'Ghế công thái học Dvary Butterfly', 'Ghế công thái học ergonomic Dvary Butterfly chính hãng code VN tặng kèm phụ kiện. Bảo hành 5 năm, sản xuất chính hãng GT chair.', 13500000, 17500000, 23, 'https://congthaihoc.vn/wp-content/uploads/2021/10/The%CC%82m-tie%CC%82u-de%CC%82%CC%80-phu%CC%A3-23-600x600.png', 'ghe-cong-thai-hoc', 'GTchair', 'GT Chair', 4.8, NOW(), NOW()),
('ergohuman-classic', 'Ghế công thái học Ergohuman Classic', 'Ghế công thái học ergonomic Ergohuman bản Classic với thiết kế tinh tế, hỗ trợ tư thế ngồi tối ưu. Bảo hành 3 năm chính hãng.', 11500000, 12500000, 8, 'https://congthaihoc.vn/wp-content/uploads/2021/10/The%CC%82m-tie%CC%82u-de%CC%82%CC%80-phu%CC%A3-23-600x600.png', 'ghe-cong-thai-hoc', 'Ergohuman', 'Ergohuman', 4.7, NOW(), NOW()),
('felix-6232a', 'Ghế công thái học Felix 6232A', 'Ghế công thái học Ergonomic Felix 6232A phù hợp với người từ 1m65. Miễn phí vận chuyển và lắp đặt nội thành Hà Nội và TP HCM.', 2900000, 3200000, 9, 'https://congthaihoc.vn/wp-content/uploads/2021/10/The%CC%82m-tie%CC%82u-de%CC%82%CC%80-phu%CC%A3-23-600x600.png', 'ghe-cong-thai-hoc', 'Felix', 'Felix', 4.3, NOW(), NOW());
```
