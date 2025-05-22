import Image from 'next/image';
import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
   

   

      {/* Feature sections */}
      <div className="mt-16">
        <div className="relative bg-gray-50 rounded-lg overflow-hidden p-10 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">VỮNG TƯ THẾ - VỮNG TƯƠNG LAI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4">Thiết kế lưng kép Twin-back Multi-flex</h4>
              <p className="text-gray-600">
                Cấu trúc lưng kép Twin-back với công nghệ Multi-flex, cụm lưng chỉnh lưng lên xuống nhiều nấc và gập trước sau linh động, độc lập 2 mảnh lưng giúp làm giảm áp lực lên cột sống
              </p>
            </div>
            <div className="relative h-64 bg-gray-200 rounded-lg">
              {/* Placeholder for image */}
            </div>
          </div>
        </div>

        <div className="relative bg-gray-50 rounded-lg overflow-hidden p-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Điểm nổi bật khác của Gami Metic</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <h4 className="text-lg font-semibold mb-2">Tựa đầu</h4>
              <p className="text-gray-600">
                Cho phép bạn điều chỉnh 8 hướng gồm lên xuống, tiến lùi, mặt tựa đầu chỉnh lên xuống và chỉnh các góc linh động
              </p>
            </div>
            <div>
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <h4 className="text-lg font-semibold mb-2">Lưng chỉnh 2 chiều lên xuống gập trước sau</h4>
              <p className="text-gray-600">
                Tính năng gập trước sau 2 mảnh lưng trên dưới độc lập giúp giảm áp lực dồn xuống thắt lưng khi ngồi lâu
              </p>
            </div>
            <div>
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <h4 className="text-lg font-semibold mb-2">Piston Class 4</h4>
              <p className="text-gray-600">
                Dành cho những dòng ghế cao cấp, nay đã có mặt ở Airy, tải trọng lớn, kết cấu chắc chắn hơn, cho bạn yên tâm sử dụng
              </p>
            </div>
          </div>
        </div>
      </div>

    

     
    </div>
  );
}
