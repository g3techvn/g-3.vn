-- Add sample user rewards
INSERT INTO public.user_rewards (user_id, points)
VALUES 
('eadb4541-61f0-4dd5-8455-457f628208de', 1000),
('0c7dad74-ddd0-4018-9c96-81ee18311e30', 500),
('247735c8-55b6-4965-9f6e-846bff8e89d7', 100);

-- Add sample reward transactions
INSERT INTO public.reward_transactions (user_id, type, points, reason, related_order_id)
VALUES 
-- Admin transactions
('eadb4541-61f0-4dd5-8455-457f628208de', 'earn', 500, 'Welcome bonus', NULL),
('eadb4541-61f0-4dd5-8455-457f628208de', 'earn', 500, 'First order completed', 101),

-- Sale transactions
('0c7dad74-ddd0-4018-9c96-81ee18311e30', 'earn', 300, 'Welcome bonus', NULL),
('0c7dad74-ddd0-4018-9c96-81ee18311e30', 'earn', 200, 'First order completed', 102),

-- Customer transactions
('247735c8-55b6-4965-9f6e-846bff8e89d7', 'earn', 50, 'Welcome bonus', NULL),
('247735c8-55b6-4965-9f6e-846bff8e89d7', 'earn', 50, 'First order completed', 103); 