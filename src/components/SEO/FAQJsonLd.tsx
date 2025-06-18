'use client';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQJsonLdProps {
  faqs: FAQItem[];
}

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  if (!faqs || faqs.length === 0) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ 
        __html: JSON.stringify(faqSchema, null, 2) 
      }}
    />
  );
}

// Generate common FAQs for products
export function generateProductFAQs(productName: string, category?: string, brand?: string): FAQItem[] {
  const faqs: FAQItem[] = [
    {
      question: `${productName} có bảo hành bao lâu?`,
      answer: "Tất cả sản phẩm của G3 đều được bảo hành chính hãng 12 tháng. Bảo hành bao gồm các lỗi kỹ thuật, linh kiện hỏng hóc do nhà sản xuất. Chúng tôi có dịch vụ bảo hành tận nơi trong khu vực nội thành."
    },
    {
      question: `Làm sao để đặt mua ${productName}?`,
      answer: "Bạn có thể đặt mua trực tiếp trên website G3, gọi hotline 0979983355, hoặc nhắn tin Zalo. Chúng tôi hỗ trợ thanh toán COD, chuyển khoản, và các ví điện tử. Miễn phí giao hàng toàn quốc."
    },
    {
      question: `${productName} có phù hợp với tôi không?`,
      answer: `${productName} được thiết kế theo tiêu chuẩn công thái học, phù hợp với đa số người dùng. ${category ? `Đặc biệt phù hợp cho ${category.toLowerCase()}.` : ''} Bạn có thể liên hệ để được tư vấn chi tiết về kích thước và tính năng phù hợp.`
    },
    {
      question: "G3 có chính sách đổi trả như thế nào?",
      answer: "G3 hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất hoặc không đúng mô tả. Sản phẩm đổi trả phải còn nguyên vẹn, chưa qua sử dụng và có đầy đủ hộp, phụ kiện."
    },
    {
      question: "Thời gian giao hàng bao lâu?",
      answer: "Thời gian giao hàng từ 1-3 ngày làm việc tại nội thành Hà Nội và TP.HCM, 3-7 ngày cho các tỉnh thành khác. Chúng tôi giao hàng miễn phí toàn quốc với đơn hàng từ 500.000đ."
    }
  ];

  // Add brand-specific FAQ if available
  if (brand) {
    faqs.push({
      question: `${brand} có chất lượng như thế nào?`,
      answer: `${brand} là thương hiệu uy tín được G3 chọn lọc kỹ càng. Tất cả sản phẩm ${brand} tại G3 đều là hàng chính hãng, có chứng nhận chất lượng và được kiểm tra kỹ trước khi giao đến khách hàng.`
    });
  }

  return faqs;
} 