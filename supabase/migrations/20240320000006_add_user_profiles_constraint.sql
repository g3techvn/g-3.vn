-- Add unique constraint on user_id in user_profiles table
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);

-- Add sample data for user profiles
INSERT INTO public.user_profiles (user_id, email, full_name, phone, avatar_url, address, date_of_birth, gender)
VALUES 
('eadb4541-61f0-4dd5-8455-457f628208de', 'admin@g3furniture.vn', 'Admin G3', '0987654321', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '123 Đường Admin, Quận 1, TP.HCM', '1990-01-01', 'male'),
('0c7dad74-ddd0-4018-9c96-81ee18311e30', 'sale@g3furniture.vn', 'Sale G3', '0987654322', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sale', '456 Đường Sale, Quận 2, TP.HCM', '1992-02-02', 'female'),
('247735c8-55b6-4965-9f6e-846bff8e89d7', 'customer@gmail.com', 'Customer G3', '0987654323', 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer', '789 Đường Customer, Quận 3, TP.HCM', '1995-03-03', 'male'); 