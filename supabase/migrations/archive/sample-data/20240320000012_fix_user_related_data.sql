-- Remove test user
DELETE FROM auth.users WHERE email = 'test1750668468936@gmail.com';

-- Delete old pending order
DELETE FROM public.orders WHERE id = 2;

-- Update shipping addresses with correct location data
DELETE FROM public.shipping_addresses;
INSERT INTO public.shipping_addresses (id, user_id, full_name, phone, province_code, district_code, ward_code, address_detail, is_default)
VALUES
-- Admin addresses (Hà Nội)
(1, 'eadb4541-61f0-4dd5-8455-457f628208de', 'Admin G3', '0987654321', 1, 1, 1, '123 Phúc Xá, Phường Phúc Xá', true),
(2, 'eadb4541-61f0-4dd5-8455-457f628208de', 'Admin G3 Office', '0987654321', 1, 2, 31, '456 Hàng Mã, Phường Hàng Mã', false),

-- Sale addresses (Hồ Chí Minh)
(3, '0c7dad74-ddd0-4018-9c96-81ee18311e30', 'Sale G3', '0987654322', 79, 760, 26734, '123 Bến Nghé, Phường Bến Nghé', true),
(4, '0c7dad74-ddd0-4018-9c96-81ee18311e30', 'Sale G3 Store', '0987654322', 79, 761, 26740, '456 Thạnh Xuân, Phường Thạnh Xuân', false),

-- Customer addresses (Đà Nẵng)
(5, '247735c8-55b6-4965-9f6e-846bff8e89d7', 'Customer G3', '0987654323', 48, 490, 20194, '123 Hải Châu 1, Phường Hải Châu 1', true),
(6, '247735c8-55b6-4965-9f6e-846bff8e89d7', 'Customer G3 Work', '0987654323', 48, 491, 20227, '456 Thanh Khê Tây, Phường Thanh Khê Tây', false);

-- Add sample products using existing brands and categories
INSERT INTO public.products (id, name, slug, brand_id, pd_cat_id, price, original_price, status)
VALUES 
(101, 'Ghế Công Thái Học Gami X1', 'ghe-cong-thai-hoc-gami-x1', 1, 1, 2000000, 2500000, true),
(102, 'Ghế Giám Đốc Sihoo M57', 'ghe-giam-doc-sihoo-m57', 2, 1, 3000000, 3500000, true),
(103, 'Ghế Văn Phòng G3-Tech GT1', 'ghe-van-phong-g3-tech-gt1', 5, 1, 1000000, 1200000, true);

INSERT INTO public.product_variants (id, product_id, color, size, price, original_price, sku, stock_quantity, is_default)
VALUES
(101, 101, 'Đen', 'Standard', 2000000, 2500000, 'GAMI-X1-DEN', 100, true),
(102, 102, 'Nâu', 'Large', 3000000, 3500000, 'SIHOO-M57-NAU', 50, true),
(103, 103, 'Xám', 'Standard', 1000000, 1200000, 'G3T-GT1-XAM', 200, true);

-- Add order items
INSERT INTO public.order_items (order_id, product_id, variant_id, quantity, price)
VALUES
-- Admin order items
(101, 102, 102, 1, 3000000),
(101, 101, 101, 1, 2000000),

-- Sale order items
(102, 102, 102, 1, 3000000),

-- Customer order items
(103, 103, 103, 1, 1000000); 