export interface FAQItem {
  question: string;
  answer: string;
}

// General FAQs for homepage and contact page
export const generalFAQs: FAQItem[] = [
  {
    question: "G3 chuyên cung cấp sản phẩm gì?",
    answer: "G3 chuyên cung cấp nội thất văn phòng với thiết kế công thái học như ghế làm việc ergonomic, bàn điều chỉnh độ cao, phụ kiện văn phòng. Tất cả sản phẩm đều được nhập khẩu từ các thương hiệu uy tín và có bảo hành chính hãng."
  },
  {
    question: "Tại sao nên chọn nội thất công thái học từ G3?",
    answer: "Nội thất công thái học giúp cải thiện tư thế ngồi, giảm đau lưng, tăng năng suất làm việc. G3 cam kết cung cấp sản phẩm chất lượng cao, bảo hành 12 tháng, giao hàng miễn phí và tư vấn chuyên nghiệp 24/7."
  },
  {
    question: "G3 có showroom để khách hàng trải nghiệm sản phẩm không?",
    answer: "Có, G3 có showroom tại Tầng 7, Tòa nhà Charmvit, số 117 Trần Duy Hưng, Cầu Giấy, Hà Nội. Khách hàng có thể đến trực tiếp để xem và trải nghiệm sản phẩm. Giờ làm việc: 8:00-17:30 (T2-T6), 8:00-16:00 (T7)."
  },
  {
    question: "Làm thế nào để liên hệ với G3?",
    answer: "Bạn có thể liên hệ G3 qua: Hotline: 0979983355, Email: info@g-3.vn, Zalo: https://zalo.me/0979983355, hoặc đến trực tiếp showroom. Chúng tôi hỗ trợ tư vấn 24/7."
  },
  {
    question: "G3 có giao hàng toàn quốc không?",
    answer: "Có, G3 giao hàng miễn phí toàn quốc với đơn hàng từ 500.000đ. Thời gian giao hàng: 1-3 ngày tại nội thành HN/HCM, 3-7 ngày các tỉnh thành khác. Chúng tôi đóng gói cẩn thận và có bảo hiểm hàng hóa."
  },
  {
    question: "Chính sách thanh toán của G3 như thế nào?",
    answer: "G3 hỗ trợ đa dạng hình thức thanh toán: COD (thanh toán khi nhận hàng), chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ, QR Code. Khách hàng có thể chọn hình thức phù hợp nhất."
  }
];

// Category-specific FAQs
export const categoryFAQs: Record<string, FAQItem[]> = {
  'ghe-van-phong': [
    {
      question: "Làm thế nào để chọn ghế văn phòng phù hợp?",
      answer: "Khi chọn ghế văn phòng, bạn cần xem xét: chiều cao tương ứng với bàn làm việc, khả năng điều chỉnh độ cao, tựa lưng hỗ trợ cột sống, chất liệu thoáng khí, và trọng lượng chịu được. G3 có đội ngũ tư vấn chuyên nghiệp để hỗ trợ bạn chọn sản phẩm phù hợp."
    },
    {
      question: "Ghế ergonomic có lợi ích gì?",
      answer: "Ghế ergonomic giúp: hỗ trợ tư thế ngồi đúng, giảm áp lực lên cột sống, cải thiện lưu thông máu, giảm mệt mỏi khi làm việc lâu, tăng năng suất và sức khỏe người dùng. Đây là lựa chọn tối ưu cho môi trường văn phòng hiện đại."
    },
    {
      question: "Ghế văn phòng có thể chịu được trọng lượng bao nhiêu?",
      answer: "Tùy theo từng model, ghế văn phòng tại G3 có thể chịu trọng lượng từ 100-150kg. Thông tin chi tiết về sức chịu tải được ghi rõ trong mô tả sản phẩm. Bạn nên chọn ghế có sức chịu tải cao hơn 20-30% so với trọng lượng cơ thể."
    }
  ],
  'ban-lam-viec': [
    {
      question: "Bàn điều chỉnh độ cao có lợi ích gì?",
      answer: "Bàn điều chỉnh độ cao cho phép thay đổi tư thế làm việc giữa ngồi và đứng, giúp cải thiện sức khỏe, tăng năng suất, giảm đau lưng và cải thiện lưu thông máu. Đây là xu hướng văn phòng hiện đại và được khuyến khích bởi các chuyên gia y tế."
    },
    {
      question: "Kích thước bàn làm việc nào phù hợp?",
      answer: "Kích thước bàn phụ thuộc vào không gian và nhu cầu sử dụng. Bàn 120x60cm phù hợp cho 1 người, 140x70cm cho không gian rộng rãi, 160x80cm cho làm việc nhóm. G3 tư vấn kích thước phù hợp dựa trên không gian và nhu cầu cụ thể."
    }
  ]
};

// Business FAQs for about/contact pages
export const businessFAQs: FAQItem[] = [
  {
    question: "G3 là công ty gì và hoạt động từ khi nào?",
    answer: "G3 (Công Ty Cổ phần Công nghệ G3 Việt Nam) là đơn vị chuyên cung cấp nội thất văn phòng công thái học. Chúng tôi cam kết mang đến sản phẩm chất lượng cao, phù hợp với tiêu chuẩn ergonomic quốc tế, giúp cải thiện môi trường làm việc tại Việt Nam."
  },
  {
    question: "Tầm nhìn và sứ mệnh của G3 là gì?",
    answer: "Tầm nhìn: Trở thành nhà cung cấp nội thất văn phòng công thái học hàng đầu Việt Nam. Sứ mệnh: Cải thiện sức khỏe và năng suất làm việc thông qua các sản phẩm nội thất ergonomic chất lượng cao, giá cả hợp lý và dịch vụ chuyên nghiệp."
  },
  {
    question: "G3 có những chính sách hỗ trợ khách hàng nào?",
    answer: "G3 cung cấp: Bảo hành chính hãng 12 tháng, giao hàng miễn phí toàn quốc, tư vấn miễn phí 24/7, hỗ trợ đổi trả trong 7 ngày, dịch vụ bảo trì định kỳ, và chương trình khuyến mãi thường xuyên cho khách hàng thân thiết."
  }
]; 