'use client';

import { ContactForm } from '@/components/ui/ContactForm';

export default function ContactPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Liên hệ</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>
            <p className="text-gray-700 mb-2">
              <strong>Địa chỉ:</strong> 199/14B đường 3 tháng 2, phường 11, quận 10, Hồ Chí Minh
              (đối diện nhà hát Hòa Bình)
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Điện thoại:</strong> 0983 410 222
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Email:</strong> contact@G3 TECH.vn
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Thời gian làm việc:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 text-gray-700 mb-4">
              <li>Thứ 2 - Thứ 7: 9:00 - 20:00</li>
              <li>Chủ nhật: 9:00 - 14:00</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Gửi tin nhắn cho chúng tôi</h2>
            <ContactForm />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Bản đồ</h2>
          <div className="h-96 bg-gray-200 rounded-md flex items-center justify-center">
            <p className="text-gray-600">Bản đồ Google Maps sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </div>
    </main>
  );
} 