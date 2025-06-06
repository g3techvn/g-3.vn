import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="container px-4 mx-auto py-4 rounded-xl my-4">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">VỮNG TƯ THẾ - VỮNG TƯƠNG LAI</h1>
      <div className="relative rounded-xl mb-8">
        <img src="https://file.hstatic.net/200000912647/file/72.png" alt="Banner" className="w-full object-cover" />
        <div className="absolute top-4 left-4 p-6 rounded-xl max-w-md">
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Thiết kế lưng<br />
            Butterfit 2D chất liệu Carbon
          </h2>
          <p className="mb-6 text-base text-gray-700">
            Thiết kế 3 mảnh thông minh gồm mảnh trên có thể chỉnh lên xuống 5cm. Phần cụm đỡ lưng dưới thiết kế chia làm 2 mảnh cánh bướm Butterfit 2D kết hợp cụm 4 lò xo ôm trọn phần thắt lưng, đây là công nghệ cao cấp lần đầu tiên có ở 1 chiếc ghế giá tầm trung
          </p>
          <button className="bg-black text-white px-6 py-3 rounded-full font-bold">Xem thêm</button>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold mb-2 border-b border-gray-200 pb-2">Điểm nổi bật khác của Gami Crom</h2>
        <p className="text-base text-gray-600 mb-6">Chiếc ghế biểu tượng của Gami</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/_anh_tinh_nang_gami_crom_metal.png" alt="Tựa lưng Carbon" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tựa lưng Carbon</h3>
            <p className="text-gray-700 text-base mb-1">Sử dụng chất liệu Carbon cao cấp</p>
            <p className="text-gray-700 text-base">Phần cụm đỡ lưng dưới thiết kế 2 mảnh cánh bướm Butterfit 2D + cụm 4 lò xo ôm trọn phần thắt lưng</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/1_8831e4364c83432ead793a012d06b8f5.png" alt="Tựa cổ HeadFlex 8D" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tựa cổ HeadFlex 8D</h3>
            <p className="text-gray-700 text-base">Thiết kế HeadFlex 8D rộng rãi và chỉnh được 8 hướng linh động</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/4_fbe471df721346dc9f069529501eedae.png" alt="Bộ điều khiển" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Bộ điều khiển</h3>
            <p className="text-gray-700 text-base">Multi Button điều khiển bằng nút</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/3_2d260e3cef35446385d3040557756370.png" alt="Tay ghế" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tay ghế</h3>
            <p className="text-gray-700 text-base">Tay ghế xoay 360 độ</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/2_08e75e0e9b3040be889eb478fe43188f.png" alt="Lưới ghế" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Lưới ghế</h3>
            <p className="text-gray-700 text-base">Lưới solidmesh USA (chứng chỉ OEKO-TEX® STANDARD 100) bền bỉ và thân thiện với người dùng</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/6_0412d7a7233b4357be6f144e8bcb81d4.png" alt="Trượt mâm" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Trượt mâm</h3>
            <p className="text-gray-700 text-base">Mâm ghế trượt tiến lùi 5cm</p>
          </div>
        </div>
      </div>
      <div className=" w-full  mb-8">
        <img src="https://file.hstatic.net/200000912647/file/crom__2__b0d7d6a354fe444a99215207a3a92cfd.png" alt="Sử dụng 1" className="rounded-xl" />
      </div>
      <div className=" w-full  mb-8">
        <img src="https://file.hstatic.net/200000912647/file/crom_01a5f6dfc29d4756a408daf8946bf6a6.png" alt="Sử dụng 1" className="rounded-xl" />
      </div>
     
      <h2 className="text-xl font-bold mb-4 text-center">Thông số kích thước</h2>
      <p className="text-center text-gray-700 text-base mb-1">Bản vẽ kích thước của ghế cho bạn nếu cần, bao gồm cả kích thước hộp và trọng lượng của ghế.</p>

      <div className="bg-gray-100 rounded-xl  flex flex-col items-center justify-center mb-8">
        <img src="https://file.hstatic.net/200000912647/file/thong_so_gm_crom.png" alt="Thông số kích thước" className="rounded-xl" />
      </div>
    </div>
  );
}
