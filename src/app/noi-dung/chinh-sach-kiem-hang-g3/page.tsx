import React from 'react';

export default function InspectionPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Chính sách kiểm hàng</h1>
      
      <div className="prose max-w-none">
        <p>
          G3 Tech cam kết đảm bảo chất lượng sản phẩm với quy trình kiểm hàng nghiêm ngặt.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-4">1. Quy trình kiểm hàng</h2>
        <ol className="list-decimal pl-6">
          <li>Kiểm tra bao bì, tem niêm phong</li>
          <li>Kiểm tra đầy đủ phụ kiện</li>
          <li>Kiểm tra hoạt động của sản phẩm</li>
          <li>Kiểm tra chất lượng hình thức</li>
        </ol>

        <h2 className="text-xl font-semibold mt-6 mb-4">2. Tiêu chuẩn kiểm hàng</h2>
        <ul className="list-disc pl-6">
          <li>Sản phẩm phải còn mới 100%</li>
          <li>Không có dấu hiệu sử dụng</li>
          <li>Đầy đủ phụ kiện theo quy định</li>
          <li>Hoạt động tốt, không có lỗi</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">3. Quyền lợi khách hàng</h2>
        <ul className="list-disc pl-6">
          <li>Được kiểm tra sản phẩm trước khi nhận</li>
          <li>Được từ chối nhận hàng nếu không đạt yêu cầu</li>
          <li>Được đổi trả nếu phát hiện lỗi sau khi nhận hàng</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">4. Liên hệ</h2>
        <p>
          Nếu có thắc mắc về chính sách kiểm hàng, vui lòng liên hệ:
        </p>
        <ul className="list-disc pl-6">
          <li>Email: support@g3.vn</li>
          <li>Hotline: 1900 1234</li>
        </ul>
      </div>
    </div>
  );
} 