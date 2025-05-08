import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chính sách bảo mật</h1>
      
      <div className="prose max-w-none">
        <p>
          G3 Tech cam kết bảo vệ thông tin cá nhân của khách hàng. Chúng tôi chỉ thu thập thông tin cần thiết để phục vụ việc giao dịch và liên lạc với khách hàng.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">1. Thông tin thu thập</h2>
        <ul className="list-disc pl-6">
          <li>Họ tên</li>
          <li>Địa chỉ email</li>
          <li>Số điện thoại</li>
          <li>Địa chỉ giao hàng</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Mục đích sử dụng</h2>
        <p>
          Thông tin được sử dụng để:
        </p>
        <ul className="list-disc pl-6">
          <li>Xử lý đơn hàng</li>
          <li>Giao hàng</li>
          <li>Liên lạc khi cần thiết</li>
          <li>Gửi thông tin khuyến mãi (nếu khách hàng đồng ý)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. Bảo mật thông tin</h2>
        <p>
          Chúng tôi cam kết:
        </p>
        <ul className="list-disc pl-6">
          <li>Không chia sẻ thông tin với bên thứ ba</li>
          <li>Sử dụng các biện pháp bảo mật tiên tiến</li>
          <li>Chỉ lưu trữ thông tin trong thời gian cần thiết</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Quyền của khách hàng</h2>
        <p>
          Khách hàng có quyền:
        </p>
        <ul className="list-disc pl-6">
          <li>Yêu cầu xem thông tin cá nhân</li>
          <li>Yêu cầu sửa đổi thông tin</li>
          <li>Yêu cầu xóa thông tin</li>
          <li>Từ chối nhận thông tin khuyến mãi</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">5. Liên hệ</h2>
        <p>
          Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ:
        </p>
        <ul className="list-disc pl-6">
          <li>Email: support@g3.vn</li>
          <li>Hotline: 1900 1234</li>
        </ul>
      </div>
    </div>
  );
} 