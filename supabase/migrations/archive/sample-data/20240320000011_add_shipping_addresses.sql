-- Add sample shipping addresses
INSERT INTO public.shipping_addresses (user_id, full_name, phone, province_code, district_code, ward_code, address_detail, is_default)
VALUES 
-- Admin addresses (Hà Nội)
('eadb4541-61f0-4dd5-8455-457f628208de', 'Admin G3', '0987654321', 1, 1, 1, '123 Đường Phúc Xá, Phường Phúc Xá', true),
('eadb4541-61f0-4dd5-8455-457f628208de', 'Admin G3 Office', '0987654321', 1, 2, 31, '456 Đường Hàng Mã, Phường Hàng Mã', false),

-- Sale addresses (Hồ Chí Minh)
('0c7dad74-ddd0-4018-9c96-81ee18311e30', 'Sale G3', '0987654322', 79, 760, 26734, '123 Đường Bến Nghé, Phường Bến Nghé', true),
('0c7dad74-ddd0-4018-9c96-81ee18311e30', 'Sale G3 Store', '0987654322', 79, 761, 26740, '456 Đường Thạnh Xuân, Phường Thạnh Xuân', false),

-- Customer addresses (Đà Nẵng)
('247735c8-55b6-4965-9f6e-846bff8e89d7', 'Customer G3', '0987654323', 48, 490, 20194, '123 Đường Hải Châu 1, Phường Hải Châu 1', true),
('247735c8-55b6-4965-9f6e-846bff8e89d7', 'Customer G3 Work', '0987654323', 48, 491, 20227, '456 Đường Thanh Khê Tây, Phường Thanh Khê Tây', false); 