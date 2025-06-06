import React from "react";
import { FiArrowRight } from "react-icons/fi";

const supports = [
  {
    title: "Giảm giá, ưu đãi",
    desc: "Ưu đãi thành viên, giảm giá hấp dẫn, miễn phí vận chuyển...",
  },
  {
    title: "Hỗ trợ sản phẩm",
    desc: "Tìm tài liệu hướng dẫn, khắc phục sự cố cho sản phẩm.",
  },
  {
    title: "Group cộng đồng",
    desc: "Chia sẻ kinh nghiệm, mẹo sử dụng & mua bán sản phẩm.",
  },
  {
    title: "Kích hoạt bảo hành",
    desc: "Nhập serial để kích hoạt và kiểm tra thời gian bảo hành.",
  },
  {
    title: "Cho doanh nghiệp",
    desc: "Giải pháp mua sắm số lượng lớn với chính sách giá ưu đãi.",
  },
];

const SupportSection = () => (
  <div className="container mx-auto pt-10">
    <h2 className="text-2xl uppercase font-bold mb-5">Bạn cần trợ giúp?</h2>
    <div className="flex gap-6 justify-center">
      {supports.map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl p-6 flex items-center justify-between cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg hover:bg-neutral-900 group"
        >
          <div className="flex-1 transition-colors duration-200 group-hover:text-white">
            <div className="text-xl font-semibold mb-1">{item.title}</div>
            <div className="text-base text-gray-600 group-hover:text-white transition-colors duration-200">{item.desc}</div>
          </div>
          <div className="text-xl text-gray-800 ml-4 transition-all duration-200 group-hover:text-white group-hover:rotate-90">
            <FiArrowRight />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SupportSection;
