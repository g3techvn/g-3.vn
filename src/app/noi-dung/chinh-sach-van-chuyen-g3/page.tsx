import React from 'react';

export default function ShippingPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chính sách vận chuyển</h1>
      
      <div className="prose max-w-none">
        <p>
          G3 Tech cam kết giao hàng nhanh chóng và an toàn đến tay khách hàng.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">1. Phạm vi giao hàng</h2>
        <ul className="list-disc pl-6">
          <li>Toàn quốc</li>
          <li>Miễn phí vận chuyển cho đơn hàng từ 2 triệu đồng</li>
          <li>Phí vận chuyển từ 30.000đ - 50.000đ tùy khu vực</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Thời gian giao hàng</h2>
        <ul className="list-disc pl-6">
          <li>Hà Nội: 1-2 ngày làm việc</li>
          <li>TP.HCM: 1-2 ngày làm việc</li>
          <li>Các tỉnh thành khác: 2-4 ngày làm việc</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. Quy trình giao hàng</h2>
        <ol className="list-decimal pl-6">
          <li>Xác nhận đơn hàng</li>
          <li>Đóng gói sản phẩm</li>
          <li>Giao cho đơn vị vận chuyển</li>
          <li>Giao hàng đến khách hàng</li>
        </ol>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Liên hệ</h2>
        <p>
          Nếu có thắc mắc về chính sách vận chuyển, vui lòng liên hệ:
        </p>
        <ul className="list-disc pl-6">
          <li>Email: support@g3.vn</li>
          <li>Hotline: 1900 1234</li>
        </ul>
      </div>
    </div>
  );
} 