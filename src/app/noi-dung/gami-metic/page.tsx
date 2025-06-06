import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="container px-4 mx-auto py-4 rounded-xl my-4">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">VỮNG TƯ THẾ - VỮNG TƯƠNG LAI</h1>
      <div className="relative rounded-xl mb-8">
        <img src="https://file.hstatic.net/200000912647/file/5_ab9a8f1fc68c4e68a133480fd6203e41.png" alt="Banner" className="w-full object-cover" />
        <div className="absolute top-4 left-4  p-6 rounded-xl max-w-md">
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Thiết kế lưng kép<br />
            Twin-back Multi-flex
          </h2>
          <p className="mb-6 text-base text-gray-700">
            Cấu trúc lưng kép Twin-back với công nghệ Multi-flex, cụm lưng chỉnh lưng lên xuống nhiều nấc và gập trước sau linh động, độc lập 2 mảnh lưng giúp làm giảm áp lực lên cột sống
          </p>
          <button className="bg-black text-white px-6 py-3 rounded-full font-bold">Xem thêm</button>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold mb-2 border-b border-gray-200 pb-2">Điểm nổi bật khác của Gami Metic</h2>
        <p className="text-base text-gray-600 mb-6">Chiếc ghế của sự tỉ mỉ</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/1_4071ed48b6114d03a74c9f0f027c1f8e.png" alt="Chất liệu lưới Krall + Roth" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Chất liệu lưới Krall + Roth</h3>
            <p className="text-gray-700 text-base mb-1">Lưới ghế nhập khẩu từ Đức đạt chứng chỉ OEKO-TEX® STANDARD 100.</p>
            <p className="text-gray-700 text-base">Lưới đàn hồi tốt, thoáng khí thấm hút mồ hôi tạo cảm giác êm ái và thoáng mát, thân thiện với người dùng</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/2_b19fe66044c549df893d702937b21f86.png" alt="Tựa cổ HeadFlex 6D" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tựa cổ HeadFlex 6D</h3>
            <p className="text-gray-700 text-base">Thiết kế HeadFlex 8D rộng rãi và chỉnh được 8 hướng linh động</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/3_82e7009b785242f8b331cea505893c30.png" alt="Kê tay 3D" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Kê tay 3D</h3>
            <p className="text-gray-700 text-base">Kê tay chỉnh lên xuống, tiến lùi và xoay trái phải</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/4.png" alt="Chân ghế" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Chân ghế</h3>
            <p className="text-gray-700 text-base">Chân ghế bằng kim loại bền chắc, không bị biến dạng.</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/5_57654aeace924b268a00ed83fd8b3d87.png" alt="Tựa lưng" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tựa lưng</h3>
            <p className="text-gray-700 text-base">Cấu trúc lưng kép, cụm lưng chỉnh linh hoạt, hỗ trợ cột sống tối ưu.</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/6_5d93d414bec3491986f647301035a55a.png" alt="Trượt mâm" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Trượt mâm</h3>
            <p className="text-gray-700 text-base">Mâm ghế trượt tiến lùi 5cm.</p>
          </div>
        </div>
      </div>
      <div className=" w-full  mb-8">
        <img src="https://file.hstatic.net/200000912647/file/metic__2__54f71376c6e642888f437f4453214eef.png" alt="Sử dụng 1" className="rounded-xl" />
      </div>
      <div className=" w-full  mb-8">
        <img src="https://file.hstatic.net/200000912647/file/metic_fbf9c3e57d4449579d3007a5803ed046.png" alt="Sử dụng 2" className="rounded-xl" />
      </div>
      <h2 className="text-xl font-bold mb-4 text-center">Thông số kích thước</h2>
      <div className="bg-gray-100 rounded-xl  flex flex-col items-center justify-center mb-8">
        <img src="https://file.hstatic.net/200000912647/file/thiet_ke_chua_co_ten__1__b7bbbe47f2dc4117ad642d828fccdd2a.png" alt="Thông số kích thước" className="rounded-xl" />
      </div>
    </div>
  );
}
