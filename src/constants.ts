export const COMPANY_INFO = {
  name: 'Công Ty Cổ phần Công nghệ G3 Việt Nam',
  hotline: '0979983355',
  email: 'info@g-3.vn',
  address: 'Tầng 7, Tòa nhà Charmvit, số 117 Trần Duy Hưng, Q. Cầu Giấy, TP. Hà Nội.',
  website: 'https://g-3.vn',
  workingHours: '8:00 - 17:30 (Thứ 2 - Thứ 6)',
} as const;

export const SOCIAL_LINKS = [
  { name: 'Shopee', href: 'https://shopee.vn/g3tech' },
  { name: 'Facebook', href: 'https://www.facebook.com/g3.vntech/' },
  { name: 'Tiktok', href: 'https://www.tiktok.com/@g3tech.vn' },
] as const;

export const SHIPPING_PROVIDERS = [
  { name: "ViettelPost" },
  { name: "GHTK" },
  { name: "GHN" }
] as const;

export const PAYMENT_METHODS = [
  { name: "Visa" },
  { name: "MasterCard" },
  { name: "JCB" },
  { name: "QR Pay" },
  { name: "Momo" },
  { name: "ZaloPay" }
] as const;

export const QUICK_LINKS = [
  { name: "Chính sách bảo hành", href: "/noi-dung/chinh-sach-bao-hanh-g3" },
  { name: "Chính sách đổi trả", href: "/noi-dung/chinh-sach-doi-tra-g3" },
  { name: "Chính sách vận chuyển", href: "/noi-dung/chinh-sach-van-chuyen-g3" },
  { name: "Chính sách bảo mật", href: "/noi-dung/chinh-sach-bao-mat-g3" },
  { name: "Chính sách thanh toán", href: "/noi-dung/chinh-sach-thanh-toan-g3" },
  { name: "Chính sách kiểm hàng", href: "/noi-dung/chinh-sach-kiem-hang-g3" },
] as const;

export const FEEDBACK_INFO = {
  heading: "Phản hồi & khiếu nại",
  content: "Phản hồi nóng về chất lượng sản phẩm và dịch vụ. Đội ngũ Kiểm Soát Chất Lượng của chúng tôi sẵn sàng lắng nghe quý khách.",
} as const; 