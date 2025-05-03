# Thông tin dự án g-3.vn (Website bán nội thất bàn ghế công thái học với Next.js và Supabase)

## Tiếng Việt
- **Mục tiêu:** Xây dựng website thương mại điện tử g-3.vn chuyên bán sản phẩm nội thất bàn ghế công thái học với frontend Next.js, backend Supabase.
- **Công nghệ:**
  - Next.js (React, SSR/SSG/CSR)
  - Supabase (Auth, Database, Storage)
  - Tailwind CSS (utility-first CSS framework)
  - Radix UI (bộ component UI hiện đại, accessible cho React)
  - React Query (quản lý và đồng bộ hoá dữ liệu phía client)
  - React Hook Form (xử lý form hiệu quả, dễ kiểm soát)
  - Zod (schema validation cho form và dữ liệu)
  - Axios (gọi API, xử lý HTTP request)
  - Lodash (thư viện tiện ích xử lý dữ liệu)
  - Dayjs (xử lý, format ngày giờ)
- **Tính năng chính:**
  - Đăng ký, đăng nhập, xác thực người dùng (Supabase Auth)
  - Quản lý sản phẩm (bàn, ghế công thái học...) với phân loại theo **danh mục**, **thương hiệu** và **tag**
  - Quản lý danh mục sản phẩm
  - Quản lý thương hiệu sản phẩm
  - Quản lý tag sản phẩm
  - Quản lý giỏ hàng, đặt hàng, theo dõi đơn hàng
  - Quản lý thông tin khách hàng
  - Lưu trữ ảnh sản phẩm (Supabase Storage)
  - Thanh toán (có thể tích hợp Stripe/PayPal)
  - Website không có giao diện quản trị, quản lý sản phẩm trực tiếp trên Supabase

## 0. Cấu trúc dữ liệu (Supabase)

### Các bảng chính:
- **products**: Thông tin sản phẩm (id, name, description, price, image_url, category_id, brand_id, ...)
- **categories**: Danh mục sản phẩm (id, name, description)
- **brands**: Thương hiệu sản phẩm (id, name, description)
- **tags**: Tag sản phẩm (id, name)
- **product_tags**: Bảng liên kết nhiều-nhiều giữa sản phẩm và tag (product_id, tag_id)
- **users**: Thông tin người dùng (id, email, name, address, phone, ...)
- **orders**: Đơn hàng (id, user_id, status, total_price, created_at, ...)
- **order_items**: Sản phẩm trong đơn hàng (id, order_id, product_id, quantity, price)
- **blog_posts**: Bài viết blog (id, title, slug, content, author_id, created_at, ...)

### Mối quan hệ:
- Mỗi **product** thuộc một **category** (category_id) và một **brand** (brand_id)
- Mỗi **product** có thể có nhiều **tag** (thông qua bảng product_tags)
- Mỗi **order** thuộc về một **user** (user_id)
- Mỗi **order** có nhiều **order_items** (1-n)
- Mỗi **order_item** liên kết tới một **product**
- Mỗi **blog_post** có thể liên kết tới một **user** (author_id)

## 1. Cấu trúc thư mục đề xuất

```
g-3.vn/
├── public/                 # Ảnh, favicon, static files
├── src/
│   ├── components/         # Các component dùng lại (Button, Header, Footer, ProductCard...)
│   ├── features/           # Các module tính năng
│   │   ├── product/        # Quản lý sản phẩm (hiển thị, chi tiết, tìm kiếm, lọc theo danh mục/thương hiệu/tag)
│   │   ├── category/       # Quản lý danh mục sản phẩm
│   │   ├── brand/          # Quản lý thương hiệu sản phẩm
│   │   ├── tag/            # Quản lý tag sản phẩm
│   │   ├── cart/           # Quản lý giỏ hàng
│   │   ├── order/          # Quản lý đơn hàng
│   │   ├── user/           # Quản lý thông tin người dùng, profile
│   │   └── auth/           # Đăng nhập, đăng ký, xác thực
│   ├── pages/              # Trang Next.js (theo routing)
│   │   ├── index.tsx       # Trang chủ
│   │   ├── products/       # Trang danh sách sản phẩm
│   │   ├── categories/     # Trang danh mục
│   │   ├── brands/         # Trang thương hiệu
│   │   ├── tags/           # Trang tag sản phẩm
│   │   ├── cart.tsx        # Trang giỏ hàng
│   │   ├── order/          # Trang đơn hàng
│   │   ├── profile.tsx     # Trang thông tin cá nhân
│   │   ├── policy/         # Các trang chính sách
│   │   │   ├── privacy.tsx         # Chính sách bảo mật
│   │   │   ├── return.tsx          # Chính sách đổi trả
│   │   │   ├── shipping.tsx        # Chính sách vận chuyển
│   │   │   ├── terms.tsx           # Điều khoản sử dụng
│   │   │   └── contact.tsx         # Trang liên hệ
│   │   ├── blog/           # Trang blog, bài viết
│   │   │   ├── index.tsx           # Danh sách bài viết
│   │   │   └── [slug].tsx          # Trang chi tiết bài viết
│   │   └── landing/         # Các landing page cho chiến dịch, quảng cáo
│   │       ├── [slug].tsx          # Landing page động theo đường dẫn
│   │   └── ...             # Các trang khác
│   ├── styles/             # File CSS, SCSS, Tailwind config
│   ├── utils/              # Hàm tiện ích, helper
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Cấu hình Supabase, API clients
│   └── types/              # Định nghĩa TypeScript types/interfaces
├── .env.local              # Biến môi trường (Supabase URL, Key...)
├── next.config.js          # Cấu hình Next.js
├── package.json            # Thông tin package, scripts
└── README.md               # Hướng dẫn dự án
```

## 2. Gợi ý các file chính

- `src/lib/supabaseClient.ts`: Khởi tạo Supabase client
- `src/features/product/`: Quản lý sản phẩm (CRUD, hiển thị, tìm kiếm, lọc theo danh mục/thương hiệu/tag)
- `src/features/category/`: Quản lý danh mục sản phẩm
- `src/features/brand/`: Quản lý thương hiệu sản phẩm
- `src/features/tag/`: Quản lý tag sản phẩm
- `src/features/cart/`: Quản lý giỏ hàng
- `src/features/order/`: Quản lý đơn hàng
- `src/features/user/`: Quản lý thông tin người dùng
- `src/features/auth/`: Đăng nhập, đăng ký, xác thực
- `src/pages/api/`: API routes (nếu cần xử lý server-side)
- `src/pages/policy/privacy.tsx`: Trang chính sách bảo mật
- `src/pages/policy/return.tsx`: Trang chính sách đổi trả
- `src/pages/policy/shipping.tsx`: Trang chính sách vận chuyển
- `src/pages/policy/terms.tsx`: Trang điều khoản sử dụng
- `src/pages/policy/contact.tsx`: Trang liên hệ
- `src/pages/blog/index.tsx`: Trang danh sách bài viết blog
- `src/pages/blog/[slug].tsx`: Trang chi tiết bài viết blog
- `src/pages/categories/index.tsx`: Trang danh sách danh mục
- `src/pages/brands/index.tsx`: Trang danh sách thương hiệu
- `src/pages/tags/index.tsx`: Trang danh sách tag sản phẩm
- `src/pages/landing/[slug].tsx`: Landing page động cho các chiến dịch, quảng cáo

## 3. Ghi chú
- Sử dụng Supabase cho Auth, Database (Postgres), Storage (ảnh sản phẩm)
- Next.js cho frontend, có thể dùng SSR/SSG hoặc CSR tùy trang
- Sử dụng Tailwind CSS để xây dựng giao diện nhanh, responsive, dễ tuỳ biến
- Sử dụng Radix UI để xây dựng các component UI hiện đại, accessible, dễ mở rộng
- Sử dụng React Query để quản lý state và đồng bộ dữ liệu phía client hiệu quả
- Sử dụng React Hook Form để xử lý form, kết hợp validate với Zod
- Sử dụng Zod để kiểm tra, validate dữ liệu form và dữ liệu nhận từ API
- Sử dụng Axios để gọi API, xử lý HTTP request linh hoạt
- Sử dụng Lodash để thao tác, xử lý dữ liệu phức tạp
- Sử dụng Dayjs để xử lý, format ngày giờ
- Có thể tích hợp thêm Stripe/PayPal cho thanh toán
- Website không có giao diện quản trị, quản lý sản phẩm trực tiếp trên Supabase
- Landing page nên đặt trong `src/pages/landing/` (mỗi chiến dịch một file hoặc dùng [slug].tsx cho landing page động)

