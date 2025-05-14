'use client';

import { COMPANY_INFO } from '../../constants';

export default function AboutPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Về G3 TECH</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Giới thiệu</h2>
          <p className="text-gray-700 mb-4">
            G3 TECH là cửa hàng chuyên cung cấp phụ kiện điện thoại, máy ảnh và thiết bị điện tử chính hãng tại Việt Nam. 
            Chúng tôi tự hào là đối tác chính thức của nhiều thương hiệu nổi tiếng như GoPro, Insta360, Ulanzi, và nhiều hãng khác.
          </p>
          <p className="text-gray-700 mb-4">
            Với hơn 10 năm kinh nghiệm trong ngành, G3 TECH cam kết mang đến cho khách hàng những sản phẩm chất lượng cao,
            giá cả hợp lý và dịch vụ chăm sóc khách hàng tận tâm.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Cam kết của chúng tôi</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Sản phẩm chính hãng 100%</li>
            <li>Bảo hành theo tiêu chuẩn nhà sản xuất</li>
            <li>Giao hàng toàn quốc</li>
            <li>Đổi trả trong vòng 7 ngày</li>
            <li>Hỗ trợ kỹ thuật 24/7</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Liên hệ</h2>
          <p className="text-gray-700 mb-2">
            <strong>Địa chỉ:</strong> {COMPANY_INFO.address}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Điện thoại:</strong> {COMPANY_INFO.hotline}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Email:</strong> {COMPANY_INFO.email}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Thời gian làm việc:</strong> {COMPANY_INFO.workingHours}
          </p>
        </div>
      </div>
    </main>
  );
} 