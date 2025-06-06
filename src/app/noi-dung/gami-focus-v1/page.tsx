import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="container px-4 mx-auto py-4 rounded-xl my-4">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">VỮNG TƯ THẾ - VỮNG TƯƠNG LAI</h1>
      <div className="relative rounded-xl mb-8">
        <img src="https://file.hstatic.net/200000912647/file/1_5d6143de9b07412086b11bcebbf3eeee.png" alt="Banner" className="w-full object-cover" />
        <div className="absolute top-4 left-4 p-6 rounded-xl max-w-md">
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Thiết kế lưng<br />
            Twin-back <br />
            FlexSupport
          </h2>
          <p className="mb-6 text-base text-gray-700">
            Tựa lưng của Gami Focus được thiết kế 2 mảnh thông minh giúp nâng đỡ thắt lưng giúp bạn ngồi lâu vẫn cảm thấy thoải mái, đây là một trong những tính năng hiếm có của những ghế trong phân khúc 3 triệu đồng
          </p>
          <button className="bg-black text-white px-6 py-3 rounded-full font-bold">Xem thêm</button>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold mb-2 border-b border-gray-200 pb-2">Điểm nổi bật khác của Gami Focus V1</h2>
        <p className="text-base text-gray-600 mb-6">Phiên bản mâm nệm tháng khí cao cấp</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/2_f36df4da65e24575910188c455a9be9a.png" alt="Chất liệu lưới Krall + Roth" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Chất liệu lưới và nệm Krall + Roth</h3>
            <p className="text-gray-700 text-base mb-1">Lưng lưới nhập khẩu từ Đức đạt chứng chỉ OEKO-TEX® STANDARD 100.</p>
            <p className="text-gray-700 text-base">Mâm nệm đàn hồi tốt thoáng khí thấm hút mồ hôi tạo cảm giác êm ái và thoáng mát.</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/1_1ee84807ab584436b170c93c28857c9d.png" alt="Tựa cổ HeadFlex 6D" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tựa cổ</h3>
            <p className="text-gray-700 text-base">Thiết kế 2D Comfort rộng rãi và trải dài về bề ngang giúp tạo cảm giác thoải mái cho phần cổ và vai gáy nhất khi ngồi</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/anh_tinh_nang_focus_v1.png" alt="Kê tay 3D" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Kê tay 2D</h3>
            <p className="text-gray-700 text-base">Kê tay chỉnh lên xuống linh động</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/4.png" alt="Chân ghế" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Chân ghế</h3>
            <p className="text-gray-700 text-base">Một trong những chiếc ghế hiếm hoi sở hữu chân ghế bằng hợp kim nhôm không rỉ trong phần khúc 3 triệu</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/5.png" alt="Tựa lưng" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tựa lưng</h3>
            <p className="text-gray-700 text-base">Tựa lưng Twin-back công nghệ Flexsupport</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/anh_tinh_nang_focus_v2__1_.png" alt="Bộ cơ khí" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Bộ cơ khí</h3>
            <p className="text-gray-700 text-base">FluidMotion System cao cấp</p>
          </div>
        </div>
      </div>
      <div className="w-full mb-8">
        <img src="https://file.hstatic.net/200000912647/file/focus_dem_820438db6c414a22bdfa192013742598.png" alt="Sử dụng 1" className="rounded-xl" />
      </div>
      <div className="w-full mb-8">
        <img src="https://file.hstatic.net/200000912647/file/focus_dem__2__86d9f40ff0214d909c19ec427cc3c0de.png" alt="Sử dụng 2" className="rounded-xl" />
      </div>
     
      <h2 className="text-xl font-bold mb-4 text-center">Thông số kích thước</h2>
      <p className="text-center text-gray-700 text-base mb-1">Bản vẽ kích thước của ghế cho bạn nếu cần, bao gồm cả kích thước hộp và trọng lượng của ghế.</p>

      <div className="bg-gray-100 rounded-xl  flex flex-col items-center justify-center mb-8">
        <img src="https://file.hstatic.net/200000912647/file/thiet_ke_chua_co_ten__12_.png" alt="Thông số kích thước" className="rounded-xl" />
      </div>
    </div>
  );
}
