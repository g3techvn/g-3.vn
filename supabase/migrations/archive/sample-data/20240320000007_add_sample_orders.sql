-- Add sample orders
INSERT INTO public.orders (id, user_id, status, total_amount, shipping_address_id, payment_method_id, shipping_carrier_id, tracking_number, notes)
VALUES
-- Admin order
(101, 'eadb4541-61f0-4dd5-8455-457f628208de', 'completed', 5000000, 1, 1, 1, 'GHN123456789', 'Giao hàng trong giờ hành chính'),

-- Sale order
(102, '0c7dad74-ddd0-4018-9c96-81ee18311e30', 'completed', 3000000, 3, 2, 2, 'GHTK987654321', 'Gọi trước khi giao'),

-- Customer order
(103, '247735c8-55b6-4965-9f6e-846bff8e89d7', 'completed', 1000000, 5, 1, 1, 'GHN456789123', 'Giao hàng cuối tuần');

-- Add sample order items (we'll add these after creating products and variants)
-- For now, we'll just set up the basic order structure 