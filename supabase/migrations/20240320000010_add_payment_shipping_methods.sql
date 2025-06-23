-- Add sample payment methods
INSERT INTO public.payment_methods (id, name, code, description, is_active, sort_order)
VALUES
(1, 'Thanh toán khi nhận hàng (COD)', 'cod', 'Thanh toán tiền mặt khi nhận hàng', true, 1),
(2, 'Chuyển khoản ngân hàng', 'bank_transfer', 'Chuyển khoản qua tài khoản ngân hàng', true, 2),
(3, 'Ví điện tử MoMo', 'momo', 'Thanh toán qua ví điện tử MoMo', true, 3),
(4, 'Thẻ tín dụng/Thẻ ghi nợ', 'credit_card', 'Thanh toán bằng thẻ Visa, Mastercard, JCB', true, 4);

-- Add sample shipping carriers
INSERT INTO public.shipping_carriers (id, name, code, description, is_active)
VALUES
(1, 'Giao hàng nhanh (GHN)', 'ghn', 'Dịch vụ giao hàng nhanh toàn quốc', true),
(2, 'Giao hàng tiết kiệm (GHTK)', 'ghtk', 'Dịch vụ giao hàng giá rẻ toàn quốc', true),
(3, 'Viettel Post', 'viettel_post', 'Dịch vụ giao hàng của Viettel', true),
(4, 'G3 Delivery', 'g3_delivery', 'Dịch vụ giao hàng nội bộ của G3', true); 