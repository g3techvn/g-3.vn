# 🛒 Hướng dẫn tính năng Checkout

## 📋 Tổng quan

Tính năng checkout đã được hoàn thiện với đầy đủ các thành phần:

### ✅ Đã hoàn thành:
- **API Endpoints**: Đầy đủ các API cần thiết
- **Database Integration**: Tích hợp hoàn chỉnh với Supabase
- **Component Frontend**: Giao diện người dùng hoàn chỉnh
- **Validation**: Kiểm tra dữ liệu đầu vào
- **Error Handling**: Xử lý lỗi toàn diện

## 🏗️ Cấu trúc hệ thống

### 1. API Endpoints

#### `/api/orders` (POST/GET)
- **POST**: Tạo đơn hàng mới
- **GET**: Lấy danh sách đơn hàng của user

#### `/api/payment-methods` (GET)
- Lấy danh sách phương thức thanh toán

#### `/api/shipping-carriers` (GET)
- Lấy danh sách đơn vị vận chuyển

#### `/api/vouchers` (GET)
- Lấy danh sách voucher khả dụng
- Hỗ trợ filter theo user

### 2. Database Tables

#### Core Tables:
- `orders`: Lưu thông tin đơn hàng chính
- `order_items`: Chi tiết sản phẩm trong đơn hàng
- `payment_methods`: Phương thức thanh toán
- `shipping_carriers`: Đơn vị vận chuyển
- `vouchers`: Mã giảm giá
- `voucher_usages`: Lịch sử sử dụng voucher
- `user_rewards`: Điểm thưởng người dùng

### 3. Frontend Components

#### Main Component: `src/components/store/checkout.tsx`
- Form nhập thông tin người mua
- Chọn địa chỉ giao hàng
- Chọn phương thức thanh toán
- Áp dụng voucher
- Sử dụng điểm thưởng
- Xem trước và tải PDF

## 🚀 Cách sử dụng

### 1. Checkout cho khách vãng lai
```typescript
const guestOrder = {
  user_id: null,
  buyer_info: {
    fullName: "Nguyễn Văn A",
    phone: "0123456789",
    email: "test@example.com"
  },
  shipping_info: {
    address: "123 Đường ABC",
    ward: "Phường XYZ",
    district: "Quận 1",
    city: "TP.HCM",
    note: "Giao hàng giờ hành chính"
  },
  payment_method: "cod",
  cart_items: [...],
  total_price: 500000,
  shipping_fee: 30000
}
```

### 2. Checkout cho user đã đăng nhập
```typescript
const userOrder = {
  user_id: "user-uuid",
  buyer_info: { 
    // Tự động lấy từ profile user
  },
  voucher: {
    code: "WELCOME10",
    discountAmount: 50000
  },
  reward_points: 100,
  // ... các trường khác
}
```

## 🧪 Test tính năng

### Chạy test tự động:
```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Chạy test checkout (trong terminal khác)
node scripts/test-checkout.js
```

### Test thủ công:

1. **Truy cập trang giỏ hàng**: `/gio-hang`
2. **Thêm sản phẩm vào giỏ hàng**
3. **Click "Thanh toán"**
4. **Điền thông tin**:
   - Thông tin người mua
   - Địa chỉ giao hàng
   - Phương thức thanh toán
5. **Áp dụng voucher** (nếu có)
6. **Sử dụng điểm thưởng** (nếu có)
7. **Click "Đặt hàng"**

## 🔧 Cấu hình

### Environment Variables (.env.local):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup:
Đảm bảo database đã được setup với đầy đủ các bảng theo schema đã định nghĩa.

## 📊 Dữ liệu mẫu

### Payment Methods:
```sql
INSERT INTO payment_methods (code, name, description, icon, is_active, sort_order) VALUES
('cod', 'Thanh toán khi nhận hàng', 'Thanh toán tiền mặt khi nhận hàng', 'cod', true, 1),
('bank_transfer', 'Chuyển khoản ngân hàng', 'Chuyển khoản qua tài khoản ngân hàng', 'bank', true, 2);
```

### Shipping Carriers:
```sql
INSERT INTO shipping_carriers (code, name, base_fee, estimated_delivery_days, is_active) VALUES
('FREE', 'Miễn phí giao hàng', 0, 1, true),
('EXPRESS', 'Giao hàng nhanh', 50000, 0, true);
```

### Vouchers:
```sql
INSERT INTO vouchers (code, title, description, discount_type, discount_amount, min_order_value, usage_limit, valid_from, valid_to, is_active) VALUES
('WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'fixed', 100000, 500000, 100, NOW(), '2024-12-31', true);
```

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **"Payment methods not found"**
   - Kiểm tra bảng `payment_methods` có dữ liệu
   - Kiểm tra API `/api/payment-methods`

2. **"Failed to create order"**
   - Kiểm tra validate form data
   - Kiểm tra database permissions
   - Kiểm tra console logs

3. **"Voucher not found"**
   - Kiểm tra voucher còn hiệu lực
   - Kiểm tra usage limit
   - Kiểm tra user đã sử dụng voucher chưa

## 🎯 Tính năng nâng cao

### 1. Tích hợp Payment Gateway
- Có thể tích hợp VNPay, Momo, ZaloPay
- Thêm webhook xử lý payment callback

### 2. Shipping Calculator
- Tính phí ship tự động theo khoảng cách
- Tích hợp API các đơn vị vận chuyển

### 3. Order Tracking
- Theo dõi trạng thái đơn hàng
- Notification system

### 4. Inventory Management
- Kiểm tra tồn kho khi đặt hàng
- Update stock sau khi order

## 📱 Mobile Responsive

Component checkout đã được tối ưu cho mobile với:
- Responsive design
- Touch-friendly interface
- Mobile-specific modals và sheets

## 🔒 Security

- Input validation và sanitization
- Rate limiting cho API
- CSRF protection
- SQL injection prevention

---

🎉 **Tính năng checkout đã sẵn sàng cho production!** 