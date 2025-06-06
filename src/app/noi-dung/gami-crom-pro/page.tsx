import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="container px-4 mx-auto py-4 rounded-xl my-4">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">VỮNG TƯ THẾ - VỮNG TƯƠNG LAI</h1>
      <div className="relative rounded-xl mb-8">
        <img src="https://file.hstatic.net/200000912647/file/anh_sp_3__2_.png" alt="Banner" className="w-full object-cover" />
        <div className="absolute top-4 left-4 p-6 rounded-xl max-w-md">
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Thiết kế lưng<br />
            Butterfit 2D
          </h2>
          <p className="mb-6 text-base text-gray-700">
            Thiết kế 3 mảnh thông minh gồm mảnh trên có thể chỉnh lên xuống 5cm. Phần cụm đỡ lưng dưới thiết kế chia làm 2 mảnh cánh bướm Butterfit 2D kết hợp cụm 4 lò xo ôm trọn phần thắt lưng
          </p>
          <button className="bg-black text-white px-6 py-3 rounded-full font-bold">Xem thêm</button>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold mb-2 border-b border-gray-200 pb-2">Điểm nổi bật khác của Gami Crom Pro</h2>
        <p className="text-base text-gray-600 mb-6">Chiếc ghế cao cấp nhất của Gami</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/5_0ba8ccfd3a1c463c95133ddeff430b1f.png" alt="Khung hợp kim nhôm nguyên khối" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Khung hợp kim nhôm nguyên khối + Tựa lưng Butterfit Carbon</h3>
            <p className="text-gray-700 text-base mb-1">Sự dụng chất liệu Carbon cao cấp</p>
            <p className="text-gray-700 text-base">Phần cụm đỡ lưng dưới thiết kế 2 mảnh cánh bướm Butterfit 2D + cụm 4 lò xo ôm trọn phần thắt lưng</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/1_a2f62ce41da84f74bb85462977b2d18e.png" alt="Tựa cổ HeadFlex 8D" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tựa cổ HeadFlex 8D</h3>
            <p className="text-gray-700 text-base">Thiết kế HeadFlex 8D rộng rãi và chỉnh được 8 hướng linh động</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/6_4afc7e7a20234391ab655f554b5c32d1.png" alt="Bộ điều khiển" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Bộ điều khiển</h3>
            <p className="text-gray-700 text-base">Mono Control tích hợp trên 1 cần gạt</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/3_c1292da837844567aab653886f57312d.png" alt="Tay ghế" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tay ghế</h3>
            <p className="text-gray-700 text-base">Tay ghế hợp kim nhôm nguyên khối</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/2_e1385df9876643cda3849b082061d931.png" alt="Lưới ghế" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Lưới ghế</h3>
            <p className="text-gray-700 text-base">Lưới solidmesh USA (chứng chỉ OEKO-TEX® STANDARD 100) bền bỉ và thân thiện với người dùng</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/5_8e5a8cfd607f42ba8a2361c687a85a96.png" alt="Trượt và lật mâm ghế" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Trượt và lật mâm ghế</h3>
            <p className="text-gray-700 text-base">Mâm ghế trượt tiến lùi và lật nghiêng về trước giúp giảm áp lực thắt lưng</p>
          </div>
        </div>
      </div>
      <div className=" w-full  mb-8">
        <img src="https://file.hstatic.net/200000912647/file/crom_pro_a5a2b739d0ec4feca3bc339871337f66.png" alt="Sử dụng 1" className="rounded-xl" />
      </div>
      <div className=" w-full  mb-8">
        <img src="https://file.hstatic.net/200000912647/file/crom_pro__2__abc05be792ff4768ab557cbe2a8dd453.png" alt="Sử dụng 1" className="rounded-xl" />
      </div>
     
      <h2 className="text-xl font-bold mb-4 text-center">Thông số kích thước</h2>
      <p className="text-center text-gray-700 text-base mb-1">Bản vẽ kích thước của ghế cho bạn nếu cần, bao gồm cả kích thước hộp và trọng lượng của ghế.</p>

      <div className="bg-gray-100 rounded-xl  flex flex-col items-center justify-center mb-8">
        <img src="https://file.hstatic.net/200000912647/file/thong_so_gm_crom_pro.png" alt="Thông số kích thước" className="rounded-xl" />
      </div>
    </div>
  );
}
