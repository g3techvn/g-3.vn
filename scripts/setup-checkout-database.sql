-- Create payment methods table if not exists
CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipping carriers table if not exists
CREATE TABLE IF NOT EXISTS shipping_carriers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    base_fee DECIMAL(10,2) DEFAULT 0,
    estimated_delivery_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('fixed', 'percentage', 'shipping')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INTEGER NOT NULL DEFAULT 1,
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table if not exists
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    note TEXT,
    payment_method_id BIGINT REFERENCES payment_methods(id),
    shipping_carrier_id BIGINT REFERENCES shipping_carriers(id),
    tracking_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table if not exists
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON payment_methods;
CREATE POLICY "Enable read access for all users" ON payment_methods 
    FOR SELECT USING (COALESCE(is_active, true) = true);

DROP POLICY IF EXISTS "Enable read access for all users" ON shipping_carriers;
CREATE POLICY "Enable read access for all users" ON shipping_carriers 
    FOR SELECT USING (COALESCE(is_active, true) = true);

DROP POLICY IF EXISTS "Enable read access for all users" ON vouchers;
CREATE POLICY "Enable read access for all users" ON vouchers 
    FOR SELECT USING (COALESCE(is_active, true) = true);

-- Create policies for authenticated access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON orders;
CREATE POLICY "Enable read access for authenticated users" ON orders 
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON orders;
CREATE POLICY "Enable insert access for authenticated users" ON orders 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update access for users' own orders" ON orders;
CREATE POLICY "Enable update access for users' own orders" ON orders 
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON order_items;
CREATE POLICY "Enable read access for authenticated users" ON order_items 
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON order_items;
CREATE POLICY "Enable insert access for authenticated users" ON order_items 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON payment_methods TO anon, authenticated;
GRANT SELECT ON shipping_carriers TO anon, authenticated;
GRANT SELECT ON vouchers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT ON order_items TO authenticated;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vouchers_updated_at
    BEFORE UPDATE ON vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for vouchers
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON vouchers
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON vouchers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'authenticated' AND
        auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    );

CREATE POLICY "Enable update for authenticated users only" ON vouchers
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' AND
        auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND
        auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
    );

-- Create function to validate voucher
CREATE OR REPLACE FUNCTION validate_voucher(
    voucher_code TEXT,
    order_total DECIMAL
) RETURNS TABLE (
    is_valid BOOLEAN,
    message TEXT,
    discount_amount DECIMAL
) AS $$
DECLARE
    v_voucher vouchers%ROWTYPE;
BEGIN
    -- Get voucher details
    SELECT * INTO v_voucher
    FROM vouchers
    WHERE code = voucher_code
    AND is_active = true
    LIMIT 1;

    -- Check if voucher exists
    IF v_voucher.id IS NULL THEN
        RETURN QUERY SELECT false, 'Voucher không tồn tại', 0::DECIMAL;
        RETURN;
    END IF;

    -- Check if voucher is expired
    IF CURRENT_TIMESTAMP > v_voucher.valid_to THEN
        RETURN QUERY SELECT false, 'Voucher đã hết hạn', 0::DECIMAL;
        RETURN;
    END IF;

    -- Check if voucher is not yet valid
    IF CURRENT_TIMESTAMP < v_voucher.valid_from THEN
        RETURN QUERY SELECT false, 'Voucher chưa có hiệu lực', 0::DECIMAL;
        RETURN;
    END IF;

    -- Check usage limit
    IF v_voucher.used_count >= v_voucher.usage_limit THEN
        RETURN QUERY SELECT false, 'Voucher đã hết lượt sử dụng', 0::DECIMAL;
        RETURN;
    END IF;

    -- Check minimum order value
    IF order_total < v_voucher.min_order_value THEN
        RETURN QUERY SELECT 
            false, 
            'Giá trị đơn hàng chưa đạt tối thiểu: ' || v_voucher.min_order_value::TEXT, 
            0::DECIMAL;
        RETURN;
    END IF;

    -- Calculate discount amount based on type
    DECLARE
        discount DECIMAL;
    BEGIN
        CASE v_voucher.discount_type
            WHEN 'fixed' THEN
                discount := v_voucher.discount_value;
            WHEN 'percentage' THEN
                discount := ROUND((order_total * v_voucher.discount_value / 100)::NUMERIC, 2);
            WHEN 'shipping' THEN
                -- Assuming shipping fee is handled separately
                discount := 0;
            ELSE
                discount := 0;
        END CASE;

        RETURN QUERY SELECT true, 'Voucher hợp lệ', discount;
    END;
END;
$$ LANGUAGE plpgsql; 