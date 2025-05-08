import React from 'react';

export default function ReturnPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chính sách đổi trả</h1>
      
      <div className="prose max-w-none">
        <p>
          G3 Tech cam kết đảm bảo quyền lợi của khách hàng với chính sách đổi trả hàng linh hoạt và minh bạch.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">1. Điều kiện đổi trả</h2>
        <ul className="list-disc pl-6">
          <li>Sản phẩm còn nguyên vẹn, không bị trầy xước</li>
          <li>Còn đầy đủ phụ kiện và bao bì</li>
          <li>Trong thời gian bảo hành</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Thời gian đổi trả</h2>
        <ul className="list-disc pl-6">
          <li>Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</li>
          <li>Bảo hành theo thời hạn của nhà sản xuất</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. Quy trình đổi trả</h2>
        <ol className="list-decimal pl-6">
          <li>Liên hệ hotline để báo lỗi</li>
          <li>Gửi sản phẩm về trung tâm bảo hành</li>
          <li>Kiểm tra và xác nhận lỗi</li>
          <li>Đổi trả hoặc sửa chữa</li>
        </ol>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Chi phí đổi trả</h2>
        <ul className="list-disc pl-6">
          <li>Miễn phí nếu sản phẩm có lỗi từ nhà sản xuất</li>
          <li>Khách hàng chịu phí vận chuyển nếu đổi do không vừa ý</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">5. Liên hệ</h2>
        <p>
          Nếu có thắc mắc về chính sách đổi trả, vui lòng liên hệ:
        </p>
        <ul className="list-disc pl-6">
          <li>Email: support@g3.vn</li>
          <li>Hotline: 1900 1234</li>
        </ul>
      </div>
    </div>
  );
} 