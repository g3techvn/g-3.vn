import React from 'react';

export default function PaymentPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chính sách thanh toán</h1>
      
      <div className="prose max-w-none">
        <p>
          G3 Tech cung cấp nhiều phương thức thanh toán an toàn và tiện lợi cho khách hàng.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">1. Phương thức thanh toán</h2>
        <ul className="list-disc pl-6">
          <li>Thanh toán khi nhận hàng (COD)</li>
          <li>Chuyển khoản ngân hàng</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Thông tin chuyển khoản</h2>
        <ul className="list-disc pl-6">
          <li>Ngân hàng: Vietcombank</li>
          <li>Số tài khoản: 1234567890</li>
          <li>Chủ tài khoản: G3 Tech</li>
          <li>Chi nhánh: Hà Nội</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. Lưu ý khi thanh toán</h2>
        <ul className="list-disc pl-6">
          <li>Kiểm tra kỹ thông tin chuyển khoản</li>
          <li>Giữ lại biên lai giao dịch</li>
          <li>Thanh toán đúng số tiền</li>
          <li>Ghi rõ mã đơn hàng khi chuyển khoản</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Liên hệ</h2>
        <p>
          Nếu có thắc mắc về chính sách thanh toán, vui lòng liên hệ:
        </p>
        <ul className="list-disc pl-6">
          <li>Email: support@g3.vn</li>
          <li>Hotline: 1900 1234</li>
        </ul>
      </div>
    </div>
  );
} 