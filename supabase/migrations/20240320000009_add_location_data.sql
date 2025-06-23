-- Add sample provinces
INSERT INTO public.provinces (id, code, name, codename, division_type, phone_code)
VALUES
(1, 1, 'Thành phố Hà Nội', 'thanh_pho_ha_noi', 'thành phố trung ương', 24),
(2, 79, 'Thành phố Hồ Chí Minh', 'thanh_pho_ho_chi_minh', 'thành phố trung ương', 28),
(3, 48, 'Thành phố Đà Nẵng', 'thanh_pho_da_nang', 'thành phố trung ương', 236);

-- Add sample districts
INSERT INTO public.districts (id, code, name, codename, division_type, short_codename, province_code)
VALUES
-- Hà Nội
(1, 1, 'Quận Ba Đình', 'quan_ba_dinh', 'quận', 'ba_dinh', 1),
(2, 2, 'Quận Hoàn Kiếm', 'quan_hoan_kiem', 'quận', 'hoan_kiem', 1),
-- Hồ Chí Minh
(3, 760, 'Quận 1', 'quan_1', 'quận', 'quan_1', 79),
(4, 761, 'Quận 12', 'quan_12', 'quận', 'quan_12', 79),
-- Đà Nẵng
(5, 490, 'Quận Hải Châu', 'quan_hai_chau', 'quận', 'hai_chau', 48),
(6, 491, 'Quận Thanh Khê', 'quan_thanh_khe', 'quận', 'thanh_khe', 48);

-- Add sample wards
INSERT INTO public.wards (id, code, name, codename, division_type, short_codename, district_code)
VALUES
-- Ba Đình
(1, 1, 'Phường Phúc Xá', 'phuong_phuc_xa', 'phường', 'phuc_xa', 1),
(2, 4, 'Phường Trúc Bạch', 'phuong_truc_bach', 'phường', 'truc_bach', 1),
-- Hoàn Kiếm
(3, 31, 'Phường Phúc Tân', 'phuong_phuc_tan', 'phường', 'phuc_tan', 2),
(4, 34, 'Phường Hàng Mã', 'phuong_hang_ma', 'phường', 'hang_ma', 2),
-- Quận 1
(5, 26734, 'Phường Bến Nghé', 'phuong_ben_nghe', 'phường', 'ben_nghe', 760),
(6, 26737, 'Phường Bến Thành', 'phuong_ben_thanh', 'phường', 'ben_thanh', 760),
-- Quận 12
(7, 26740, 'Phường Thạnh Xuân', 'phuong_thanh_xuan', 'phường', 'thanh_xuan', 761),
(8, 26743, 'Phường Thạnh Lộc', 'phuong_thanh_loc', 'phường', 'thanh_loc', 761),
-- Hải Châu
(9, 20194, 'Phường Hải Châu 1', 'phuong_hai_chau_1', 'phường', 'hai_chau_1', 490),
(10, 20195, 'Phường Hải Châu 2', 'phuong_hai_chau_2', 'phường', 'hai_chau_2', 490),
-- Thanh Khê
(11, 20227, 'Phường Thanh Khê Tây', 'phuong_thanh_khe_tay', 'phường', 'thanh_khe_tay', 491),
(12, 20230, 'Phường Thanh Khê Đông', 'phuong_thanh_khe_dong', 'phường', 'thanh_khe_dong', 491); 