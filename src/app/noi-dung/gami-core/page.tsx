import Link from 'next/link';

export default function ProductPage() {
  return (
    <div className="container px-4 mx-auto py-4 rounded-xl my-4">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">VỮNG TƯ THẾ - VỮNG TƯƠNG LAI</h1>
      <div className="relative rounded-xl mb-8">
        <img src="https://file.hstatic.net/200000912647/file/anh_sp_3__1__a8939337465042ed85f7bd5065f838bd.png" alt="Banner" className="w-full object-cover" />
        <div className="absolute top-4 left-4 p-6 rounded-xl max-w-md">
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            Thiết kế lưng<br />
            Twin-back <br />
            FlexSupport
          </h2>
          <p className="mb-6 text-base text-gray-700">
            Tựa lưng của Gami Core được thiết kế 2 mảnh thông minh giúp nâng đỡ thắt lưng giúp bạn ngồi lâu vẫn cảm thấy thoải mái, đây là một trong những tính năng hiếm có của những ghế trong phân khúc chỉ 2 triệu đồng
          </p>
          <button className="bg-black text-white px-6 py-3 rounded-full font-bold">Xem thêm</button>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold mb-2 border-b border-gray-200 pb-2">Điểm nổi bật khác của Gami Core</h2>
        <p className="text-base text-gray-600 mb-6">6 điểm nổi bật của Gami Core</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/2_f36df4da65e24575910188c455a9be9a.png" alt="Chất liệu lưới và nệm" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Chất liệu lưới và nệm Krall + Roth</h3>
            <p className="text-gray-700 text-base mb-1">Lưng lưới nhập khẩu từ Đức đạt chứng chỉ OEKO-TEX® STANDARD 100.</p>
            <p className="text-gray-700 text-base">Mâm nệm đàn hồi tốt thoáng khí thấm hút mồ hôi tạo cảm giác êm ái và thoáng mát.</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/1_947192a5be9a4214a2e1ba3f0c35d7a8.png" alt="Tựa cổ" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Tựa cổ</h3>
            <p className="text-gray-700 text-base">Thiết kế 2D Comfort rộng rãi và trải dài về bề ngang giúp tạo cảm giác thoải mái cho phần cổ và vai gáy nhất khi ngồi</p>
          </div>
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/3_413fcdf9842d4debb836f8b980abbbc8.png" alt="Cơ chế ngả" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Cơ chế ngả</h3>
            <p className="text-gray-700 text-base">Ngả lên tới 128 độ một cách chắc chắn và thoải mái</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="flex flex-col h-full">
            <div className="overflow-hidden rounded-3xl mb-4 aspect-[3/2] bg-gray-100">
              <img src="https://file.hstatic.net/200000912647/file/4.png" alt="Chân ghế" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-extrabold text-xl mb-2">Chân ghế</h3>
            <p className="text-gray-700 text-base">Một trong những chiếc ghế hiếm hoi sở hữu chân ghế bằng hợp kim nhôm không rỉ trong phần khúc 2 triệu</p>
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
      <div className=" w-full  mb-8">
        <img src="https://file.hstatic.net/200000912647/file/core__1_.png" alt="Sử dụng 1" className="rounded-xl" />
      </div>
      <div className=" w-full  mb-8">
        <img src="https://file.hstatic.net/200000912647/file/core_1163c8e2969f423d8f6fa574a0856883.png" alt="Sử dụng 1" className="rounded-xl" />
      </div>
     
    
    </div>
  );
}
