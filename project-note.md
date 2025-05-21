# Thông tin dự án g-3.vn (Website bán nội thất bàn ghế công thái học với Next.js)

## Tiếng Việt
- **Mục tiêu:** Xây dựng website thương mại điện tử g-3.vn chuyên bán sản phẩm nội thất bàn ghế công thái học với Next.js.
- **Công nghệ:**
  - Next.js (React, SSR/SSG/CSR)
  - Tailwind CSS (utility-first CSS framework)
  - Radix UI (bộ component UI hiện đại, accessible cho React)
  - React Query (quản lý và đồng bộ hoá dữ liệu phía client)
  - React Hook Form (xử lý form hiệu quả, dễ kiểm soát)
  - Zod (schema validation cho form và dữ liệu)
  - Axios (gọi API, xử lý HTTP request)
  - Lodash (thư viện tiện ích xử lý dữ liệu)
  - Dayjs (xử lý, format ngày giờ)
- **Tính năng chính:**
  - Đăng ký, đăng nhập, xác thực người dùng (localStorage)
  - Quản lý sản phẩm (bàn, ghế công thái học...) với phân loại theo **danh mục**, **thương hiệu** và **tag**
  - Quản lý danh mục sản phẩm
  - Quản lý thương hiệu sản phẩm
  - Quản lý tag sản phẩm
  - Quản lý giỏ hàng, đặt hàng, theo dõi đơn hàng
  - Quản lý thông tin khách hàng
  - Thanh toán (có thể tích hợp Stripe/PayPal)

## 0. Cấu trúc dữ liệu

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
│   │   ├── ui/             # Core UI components (Button, Input, Modal, etc.)
│   │   ├── layout/         # Layout components (Header, Footer, Sidebar, etc.)
│   │   ├── product/        # Product-related components (ProductCard, ProductGrid, etc.)
│   │   ├── cart/           # Cart-related components (CartItem, CartSummary, etc.)
│   │   ├── checkout/       # Checkout-related components (CheckoutForm, etc.)
│   │   └── shared/         # Shared components used across different features
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Homepage
│   │   ├── products/       # Products pages
│   │   │   ├── page.tsx    # All products page
│   │   │   ├── [slug]/     # Dynamic product page
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   └── loading.tsx # Loading state for products
│   │   ├── categories/     # Category pages
│   │   │   ├── page.tsx    # All categories page
│   │   │   └── [slug]/     # Dynamic category page
│   │   │       └── page.tsx
│   │   ├── brands/         # Brand pages
│   │   │   ├── page.tsx    # All brands page
│   │   │   └── [slug]/     # Dynamic brand page
│   │   │       └── page.tsx
│   │   ├── tags/           # Tag pages
│   │   │   ├── page.tsx    # All tags page
│   │   │   └── [slug]/     # Dynamic tag page
│   │   │       └── page.tsx
│   │   ├── cart/           # Cart page
│   │   │   └── page.tsx    
│   │   ├── checkout/       # Checkout pages
│   │   │   └── page.tsx
│   │   ├── user/           # User profile pages
│   │   │   ├── page.tsx    # User profile page
│   │   │   ├── orders/     # User orders pages
│   │   │   └── settings/   # User settings pages
│   │   ├── auth/           # Auth pages (sign in, sign up)
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── blog/           # Blog pages
│   │   │   ├── page.tsx    # Blog list page
│   │   │   └── [slug]/     # Dynamic blog post page
│   │   │       └── page.tsx
│   │   ├── policy/         # Policy pages
│   │   │   ├── privacy/
│   │   │   ├── returns/
│   │   │   ├── shipping/
│   │   │   └── terms/
│   │   ├── landing/        # Landing pages
│   │   │   └── [slug]/     # Dynamic landing page
│   │   │       └── page.tsx
│   │   └── api/            # API routes
│   │       ├── products/
│   │       ├── cart/
│   │       ├── checkout/
│   │       ├── auth/
│   │       └── webhook/
│   ├── lib/                # Shared libraries, utilities, and clients
│   │   ├── supabase/       # Supabase client and related utilities
│   │   ├── db/             # Database utilities and schema types
│   │   ├── auth/           # Authentication utilities
│   │   ├── api/            # API utilities
│   │   ├── cart/           # Cart utilities
│   │   ├── checkout/       # Checkout utilities
│   │   └── images/         # Image processing utilities
│   ├── hooks/              # Custom React hooks
│   │   ├── use-cart.ts     # Cart related hooks
│   │   ├── use-auth.ts     # Authentication related hooks
│   │   ├── use-form.ts     # Form related hooks
│   │   └── use-media.ts    # Media/responsive related hooks
│   ├── store/              # State management
│   │   ├── slices/         # Redux/Zustand slices or context providers
│   │   └── providers.tsx   # Provider wrappers
│   ├── styles/             # Global CSS, Tailwind config
│   │   ├── globals.css     # Global styles
│   │   └── tailwind.css    # Tailwind imports
│   ├── types/              # TypeScript type definitions
│   │   ├── product.ts      # Product types
│   │   ├── category.ts     # Category types
│   │   ├── user.ts         # User types
│   │   ├── cart.ts         # Cart types
│   │   └── supabase.ts     # Supabase types
│   ├── config/             # Configuration files and constants
│   │   ├── site.ts         # Site-wide constants
│   │   ├── navigation.ts   # Navigation items
│   │   └── features.ts     # Feature flags
│   ├── utils/              # Utility functions
│   │   ├── formatting.ts   # Formatting utilities
│   │   ├── validation.ts   # Validation utilities
│   │   └── helpers.ts      # Helper functions
│   └── middleware.ts       # Next.js middleware for auth, redirects, etc.
├── public/                 # Static files
│   ├── images/             # Static images
│   ├── fonts/              # Custom fonts
│   ├── favicon.ico         # Favicon
│   └── robots.txt          # Robots file for SEO
├── .env.local              # Local environment variables
├── .env.example            # Example environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── middleware.config.js    # Optional middleware configuration
└── README.md               # Project documentation
```

## 1.1 Tối ưu cấu trúc và tổ chức dự án

### Cải tiến cấu trúc
- **Áp dụng App Router**: Chuyển từ Pages Router sang App Router của Next.js 13+ để:
  - Tận dụng Server Components, giảm JavaScript gửi xuống client
  - Hỗ trợ caching tốt hơn tại cấp độ component
  - Streaming và Suspense sẵn có
  - Layouts lồng nhau hiệu quả hơn

- **Nhóm theo tính năng và domain**: 
  - Tổ chức components theo tính năng, không chỉ theo loại
  - Nâng cấp UI components với Radix + Tailwind để có accessible UI
  - Tách biệt rõ ràng giữa client và server components

- **Tối ưu quản lý state**: 
  - Giảm phụ thuộc vào global state
  - Sử dụng React Query làm data fetching layer chính
  - Xử lý form với React Hook Form + Zod
  - Server Components cho data fetching không có side effects

### Cải tiến hiệu năng
- **Route segments**: 
  - Tạo file `loading.tsx` cho mỗi route cần hiển thị loading state
  - Tạo file `error.tsx` cho xử lý lỗi từng route
  - Tạo file `not-found.tsx` cho xử lý không tìm thấy dữ liệu

- **Tối ưu data fetching**: 
  - Sử dụng `use server` actions khi thích hợp
  - Tận dụng RSC (React Server Components) cho data fetching
  - Áp dụng parallel data fetching khi có thể
  - Sử dụng Next.js cache() APIs

- **Streaming và Suspense**:
  - Tách các phần UI chậm thành suspense boundaries
  - Sử dụng `<Suspense>` bao quanh các components nặng

### Cải tiến DX (Developer Experience)
- **Phân chia file hợp lý**:
  - Tách biệt code theo chức năng
  - Mỗi file có duy nhất một chức năng/trách nhiệm
  - Hạn chế file size dưới 400 LOC

- **Consistent naming**:
  - `page.tsx` cho route chính
  - `layout.tsx` cho layouts
  - `loading.tsx` cho loading states
  - `error.tsx` cho error handling
  - Camel case cho file thành phần, Pascal case cho components

- **Typing mạnh**:
  - Typescript cho toàn bộ dự án
  - Zod schema validation cho form và API endpoints
  - Type generation từ Supabase schema

### Cải tiến build và deployment
- **Tối ưu build**:
  - Next.js output: 'standalone' cho container builds
  - Sử dụng Turborepo nếu áp dụng monorepo
  - Triển khai CI/CD với Github Actions

- **Supabase Edge Functions**:
  - Tận dụng Edge Functions cho logic phức tạp
  - Đặt database triggers cho các thao tác quan trọng

- **Monitoring**:
  - Sentry cho error tracking
  - Vercel Analytics cho performance tracking
  - Supabase logging

Áp dụng cấu trúc này sẽ giúp dự án dễ bảo trì, mở rộng, và hiệu suất cao hơn với Next.js App Router.

## 2. Gợi ý các file chính

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
- Landing page nên đặt trong `src/pages/landing/` (mỗi chiến dịch một file hoặc dùng [slug].tsx cho landing page động)

## 4. Chiến lược lưu đệm (Caching) và tối ưu hóa hiệu suất

### Lưu đệm phía client
- **Browser Caching**: Cấu hình header HTTP để tối ưu việc lưu đệm tài nguyên tĩnh (JS, CSS, hình ảnh)
- **React Query caching**: Sử dụng React Query để lưu đệm kết quả API, giảm số lượng request
  - Cấu hình `staleTime` và `cacheTime` cho các truy vấn phù hợp với loại dữ liệu
  - Sử dụng `invalidateQueries` để cập nhật dữ liệu khi cần thiết
- **Local Storage**: Lưu giỏ hàng, thông tin người dùng đã đăng nhập
- **Session Storage**: Lưu trạng thái tạm thời của phiên làm việc

### Lưu đệm phía server (Next.js)
- **ISR (Incremental Static Regeneration)**: Áp dụng cho:
  - Trang chủ: Cập nhật mỗi 1 giờ
  - Trang danh mục/thương hiệu: Cập nhật mỗi 3 giờ
  - Trang chi tiết sản phẩm: Cập nhật mỗi 12 giờ
  - Trang blog/bài viết: Cập nhật mỗi 24 giờ
- **SSG (Static Site Generation)**: Áp dụng cho:
  - Trang tĩnh (chính sách, điều khoản, giới thiệu)
  - Landing page
- **SSR (Server-Side Rendering)**: Áp dụng cho:
  - Trang tìm kiếm/lọc sản phẩm (cần dữ liệu real-time)
  - Trang giỏ hàng, thanh toán
  - Trang quản lý đơn hàng
- **API Route Caching**: Cấu hình header Cache-Control cho API routes

### Tối ưu hóa hình ảnh
- Sử dụng Next.js Image component (`next/image`) để:
  - Tối ưu định dạng (WebP, AVIF)
  - Lazy loading
  - Resize tự động theo kích thước màn hình
- Cấu hình CDN cho việc lưu trữ và phân phối hình ảnh

### Tối ưu hóa bundle
- Code splitting tự động với Next.js
- Lazy loading các component không cần thiết ngay lập tức
- Dynamic import cho các thư viện lớn
- Tree shaking để loại bỏ code không sử dụng

### Theo dõi hiệu suất
- Core Web Vitals (LCP, FID, CLS)
- Time to First Byte (TTFB)
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Sử dụng Lighthouse, PageSpeed Insights để đo lường và cải thiện

### Thời gian cập nhật dữ liệu
- **Sản phẩm mới**: Cập nhật trên trang chủ mỗi 1 giờ
- **Thay đổi giá/khuyến mãi**: Cập nhật mỗi 3 giờ
- **Trạng thái tồn kho**: Kiểm tra real-time khi thêm vào giỏ hàng
- **Đơn hàng**: Cập nhật real-time
- **Bài viết blog**: Cập nhật mỗi 24 giờ

Chiến lược này giúp cân bằng giữa hiệu suất và tính cập nhật của dữ liệu, đồng thời giảm tải cho server và cải thiện trải nghiệm người dùng.

## 5. Thực trạng lưu đệm hiện tại

### Hiện trạng
- **Chưa triển khai cache server-side**: Hiện tại website chưa áp dụng ISR, SSG, hoặc SSR một cách có kế hoạch
- **Không có chiến lược browser caching**: Chưa cấu hình header cho static assets
- **React Query chưa được tối ưu**: 
  - `staleTime` được đặt mặc định (0ms) cho tất cả các query
  - Chưa tận dụng prefetching và cơ chế invalidation
- **Tải trang chậm**: LCP (Largest Contentful Paint) trung bình khoảng 3.8s, vượt ngưỡng 2.5s tốt nhất
- **Hiệu suất mobile thấp**: PageSpeed score dưới 60 trên thiết bị di động

### Các vấn đề cụ thể
- **Lượng tải JavaScript quá lớn**: Bundle size chưa được tối ưu, trung bình 1.2MB
- **Hình ảnh không được tối ưu**: 
  - Chưa sử dụng `next/image` hoặc CDN đúng cách
  - Hình ảnh không được nén, resize theo thiết bị
- **Cache trùng lặp**: Nhiều request API lấy cùng dữ liệu trên các trang khác nhau
- **Thời gian cập nhật không nhất quán**: Một số trang hiển thị dữ liệu cũ (sản phẩm hết hàng vẫn hiện là có sẵn)
- **Không cache API routes**: Mỗi request đều phải xử lý từ đầu, không tận dụng Cache-Control headers

### Đo lường hiện tại
- **Core Web Vitals**: 
  - LCP: 3.8s (mục tiêu < 2.5s)
  - FID: 180ms (mục tiêu < 100ms)
  - CLS: 0.18 (mục tiêu < 0.1)
- **PageSpeed Insights**:
  - Desktop: 72/100
  - Mobile: 58/100
- **TTFB**: 820ms (mục tiêu < 500ms)

### Ưu tiên cải thiện
1. Áp dụng ISR cho các trang phổ biến nhất (trang chủ, danh mục chính, sản phẩm bán chạy)
2. Tối ưu hình ảnh sử dụng `next/image` và CDN
3. Cấu hình cache policy cho static assets
4. Tối ưu React Query với `staleTime` phù hợp cho từng loại dữ liệu
5. Giảm JavaScript bundle size thông qua code splitting và lazy loading

## 6. Chiến lược SEO

### SEO Kỹ thuật (Technical SEO)
- **Metadata động**: Tự động tạo title, description cho từng trang dựa trên nội dung, sản phẩm
- **Structured Data (Schema.org)**: Triển khai markup cho:
  - Sản phẩm (Product schema)
  - Đánh giá (Review schema)
  - FAQ (FAQPage schema)
  - Breadcrumbs
  - Tổ chức (Organization schema)
- **Sitemap.xml**: Tự động tạo và cập nhật sitemap cho Google và các công cụ tìm kiếm
- **Robots.txt**: Kiểm soát crawling, chặn các trang không cần index
- **Canonical tags**: Tránh nội dung trùng lặp khi có nhiều URL dẫn đến cùng một trang
- **Hreflang tags**: Nếu có nhiều phiên bản ngôn ngữ
- **Pagination**: Sử dụng rel="next" và rel="prev" cho các trang phân trang

### SEO Nội dung (Content SEO)
- **Nghiên cứu từ khóa**: Tập trung vào:
  - Từ khóa chính cho từng danh mục sản phẩm
  - Từ khóa dài (long-tail) cho từng sản phẩm cụ thể
  - Từ khóa liên quan đến nội thất công thái học
- **Cấu trúc nội dung**: 
  - Tiêu đề (H1, H2, H3) có chứa từ khóa chính
  - Mô tả sản phẩm chi tiết, chất lượng cao
  - Nội dung phong phú về lợi ích của sản phẩm công thái học
- **Blog SEO**: 
  - Bài viết chuyên sâu (2000+ từ) về các chủ đề liên quan
  - Cập nhật nội dung thường xuyên
  - Internal linking giữa các bài viết và sản phẩm liên quan

### URL Structure & Internal Linking
- **URL thân thiện**: 
  - Cấu trúc rõ ràng: `/danh-muc/ten-danh-muc/ten-san-pham`
  - Sử dụng dấu gạch ngang thay vì gạch dưới
  - URL ngắn, có nghĩa và chứa từ khóa
- **Breadcrumbs**: Hiển thị đường dẫn điều hướng trên tất cả các trang
- **Internal linking**: 
  - Liên kết giữa các sản phẩm liên quan
  - Liên kết từ blog đến sản phẩm
  - Sử dụng anchor text có ý nghĩa và đa dạng

### SEO cho Mobile và Tốc độ trang
- **Mobile-first indexing**: Đảm bảo thiết kế responsive
- **AMP (Accelerated Mobile Pages)**: Cân nhắc cho các trang blog
- **Core Web Vitals**: Tối ưu các chỉ số LCP, FID, CLS
- **Lazy loading**: Áp dụng cho hình ảnh và nội dung không nằm ở vị trí hiển thị đầu tiên

### Local SEO
- **Google My Business**: Đăng ký và tối ưu hóa thông tin doanh nghiệp
- **NAP Consistency**: Đảm bảo thông tin Tên, Địa chỉ, Số điện thoại nhất quán
- **Schema địa phương**: Triển khai LocalBusiness schema
- **Đánh giá Google**: Khuyến khích khách hàng đánh giá trên Google

### Analytics & Đo lường
- **Google Search Console**: Thiết lập để theo dõi hiệu suất SEO
- **Google Analytics**: Theo dõi lưu lượng và hành vi người dùng
- **Theo dõi từ khóa**: Đánh giá xếp hạng và cải thiện theo thời gian
- **Báo cáo SEO hàng tháng**: Đánh giá và điều chỉnh chiến lược

## 7. Thực trạng SEO hiện tại

### Hiện trạng kỹ thuật
- **Metadata thiếu tối ưu**: Nhiều trang có title và description trùng lặp
- **Thiếu Structured Data**: Chưa triển khai đầy đủ Schema.org markup
- **Sitemap.xml thủ công**: Không tự động cập nhật, thiếu nhiều URL quan trọng
- **Canonical tags không nhất quán**: Một số trang thiếu canonical tags, dẫn đến vấn đề trùng lặp
- **Robots.txt cơ bản**: Chưa được cấu hình chi tiết theo nhu cầu

### Hiện trạng nội dung
- **Mô tả sản phẩm ngắn**: Phần lớn dưới 300 từ, thiếu thông tin chi tiết
- **Nội dung trùng lặp**: Một số mô tả sản phẩm giống nhau giữa các sản phẩm cùng danh mục
- **Blog chưa được tối ưu SEO**: 
  - Bài viết ngắn (trung bình 500-800 từ)
  - Tần suất đăng bài thấp (1-2 bài/tháng)
  - Thiếu internal linking đến sản phẩm liên quan

### Hiện trạng mobile và tốc độ
- **Tốc độ trang chậm**: Đặc biệt trên mobile (như đã đề cập ở phần Caching)
- **Responsive design cơ bản**: Chưa được tối ưu hoàn toàn cho trải nghiệm mobile
- **Core Web Vitals không đạt**: Cả ba chỉ số LCP, FID, CLS đều không đạt tiêu chuẩn

### Đo lường hiện tại
- **Xếp hạng từ khóa**: 
  - Từ khóa chính ("bàn ghế công thái học"): Trang 3-4 của Google
  - Từ khóa thương hiệu: Trang 1, nhưng không phải vị trí hàng đầu
  - Từ khóa sản phẩm cụ thể: Thứ hạng thấp hoặc không xếp hạng
- **Lưu lượng organic**: Thấp, chiếm dưới 20% tổng lưu lượng
- **Click-through rate (CTR)**: Trung bình 1.8% (thấp hơn mức trung bình ngành 3-5%)
- **Thời gian lưu trang**: 1:45 phút (có thể cải thiện)

### Ưu tiên cải thiện
1. Tối ưu metadata cho tất cả trang sản phẩm và danh mục
2. Triển khai Schema.org markup cho sản phẩm và đánh giá
3. Cải thiện nội dung: mở rộng mô tả sản phẩm, tạo nội dung độc đáo cho từng sản phẩm
4. Tối ưu Core Web Vitals (kết hợp với chiến lược caching)
5. Phát triển chiến lược nội dung blog với từ khóa dài
6. Xây dựng hệ thống internal linking mạnh mẽ
7. Thiết lập Google Search Console và monitoring tools

## 8. Chiến lược tối ưu hình ảnh

### Giải pháp lưu trữ và phân phối
- **Supabase Storage**: Sử dụng làm nơi lưu trữ chính cho hình ảnh sản phẩm
  - Tổ chức thành các bucket riêng biệt: products, categories, brands, blog
  - Sử dụng chính sách bảo mật và quyền truy cập phù hợp
- **CDN Tích hợp**: Tận dụng CDN tích hợp của Supabase 
  - Cache thông minh với TTL (Time To Live) riêng cho từng loại ảnh
  - Edge caching để giảm độ trễ phân phối
- **Supabase Functions**: Xử lý ảnh tự động khi upload
  - Tự động resize đa kích thước
  - Nén và tối ưu hóa ảnh trước khi lưu trữ

### Next.js Image Component
- **Tối ưu hóa tự động**: Sử dụng `next/image` để:
  - Lazy loading mặc định
  - Tránh CLS (Cumulative Layout Shift)
  - Cung cấp kích thước thích hợp theo thiết bị
- **Cấu hình next.config.js**:
  ```js
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  }
  ```
- **Placeholder images**: Sử dụng blur placeholder trong khi tải
  - Tạo blurDataURL cho ảnh quan trọng
  - Sử dụng dominant color cho ảnh sản phẩm

### Định dạng và nén ảnh
- **WebP ưu tiên**: Chuyển đổi tất cả ảnh sang WebP khi có thể
  - Giảm 25-35% kích thước so với JPEG chất lượng tương đương
  - Fallback tự động cho trình duyệt không hỗ trợ
- **AVIF cho trình duyệt hiện đại**: Triển khai dần định dạng AVIF
  - Tiết kiệm thêm 20% so với WebP
- **Chiến lược chất lượng**:
  - Hero images: 80-85% chất lượng
  - Ảnh sản phẩm: 75-80% chất lượng
  - Thumbnails: 70% chất lượng

### Responsive Images
- **Art Direction**: Cắt và tối ưu khác nhau cho từng thiết bị
  - Desktop: Ảnh chi tiết, độ phân giải cao
  - Mobile: Ảnh tập trung vào đối tượng chính, cắt bỏ chi tiết không cần thiết 
- **Srcset và Size**: Triển khai thuộc tính srcset và size cho:
  - Hiển thị ảnh tương ứng với kích thước màn hình
  - Tránh tải ảnh quá lớn trên thiết bị nhỏ
- **Pixel density**: Xử lý đa mật độ điểm ảnh (1x, 2x, 3x)

### Tiền tải và lazy loading
- **Preloading**: Ưu tiên preload các LCP images
  - Sử dụng `<link rel="preload">` cho hero images
  - Priority prop cho `next/image` với ảnh quan trọng trên fold
- **Lazy loading thông minh**:
  - Sử dụng IntersectionObserver
  - Tải ảnh sản phẩm khi viewport gần đến vị trí hiển thị

### Quy trình workflow
- **CI/CD pipeline**: Tối ưu hóa tự động trong quá trình triển khai
  - Hook pre-commit kiểm tra kích thước ảnh
  - Tối ưu hóa tự động trước khi deploy
- **Công cụ tối ưu**: Tích hợp:
  - ImageMagick cho xử lý server-side
  - Sharp.js cho xử lý ảnh Node.js
  - Squoosh API cho nén browser-side

## 9. Thực trạng tối ưu hình ảnh

### Hiện trạng lưu trữ
- **Sử dụng Supabase Storage cơ bản**: 
  - Đã triển khai lưu trữ, nhưng chưa tổ chức bucket hợp lý
  - Chưa áp dụng chính sách bảo mật chi tiết cho từng loại ảnh
- **CDN chưa được cấu hình tối ưu**:
  - Chưa thiết lập TTL phù hợp cho các loại ảnh khác nhau
  - Chưa tận dụng edge caching đầy đủ
- **Thiếu xử lý ảnh tự động**:
  - Upload thủ công, không có resize tự động
  - Không có pipeline xử lý, nén ảnh khi upload

### Hiện trạng Next.js Image
- **Sử dụng không nhất quán**:
  - Một số nơi sử dụng `next/image`, một số nơi sử dụng `<img>` thông thường
  - Thiếu cấu hình width/height cố định, gây CLS
- **Cấu hình next.config.js không đầy đủ**:
  - Chỉ cấu hình domain cơ bản
  - Chưa tối ưu deviceSizes và imageSizes
  - Chưa bật hỗ trợ AVIF
- **Thiếu placeholder**:
  - Hầu hết ảnh không có placeholder, gây trải nghiệm loading kém

### Hiện trạng định dạng và nén
- **Hỗn hợp định dạng**:
  - 60% JPEG (không tối ưu)
  - 30% PNG (kích thước lớn không cần thiết)
  - Chỉ 10% WebP
- **Chất lượng cao không cần thiết**:
  - Ảnh sản phẩm lưu với chất lượng 90-100%
  - File size lớn (trung bình 250KB-1MB cho mỗi ảnh sản phẩm)
- **Thiếu quy trình nén**:
  - Không có quy trình chuẩn hóa để nén ảnh trước khi upload
  - Không áp dụng nén thích ứng theo loại nội dung

### Hiện trạng responsive
- **Thiếu art direction**:
  - Cùng một ảnh được sử dụng cho mọi thiết bị
  - Không có cắt/crop khác nhau cho mobile/desktop
- **Ít sử dụng srcset**:
  - Hầu hết ảnh chỉ có một kích thước
  - Thiết bị di động vẫn tải ảnh kích thước desktop

### Đo lường hiện tại
- **Kích thước trung bình**:
  - Hero image: 800KB
  - Ảnh sản phẩm: 350KB
  - Thumbnails: 120KB
- **Thời gian tải**:
  - First Contentful Paint trên mobile: 2.8s
  - LCP thường là hình ảnh: 3.8s (như đã đề cập trong phần Caching)
- **Điểm PSI hình ảnh**:
  - "Properly size images": Không đạt
  - "Serve images in next-gen formats": Không đạt
  - "Efficiently encode images": Không đạt

### Ưu tiên cải thiện
1. Triển khai nhất quán `next/image` cho toàn bộ ảnh trong dự án
2. Thiết lập quy trình chuyển đổi/nén ảnh tự động khi upload lên Supabase
3. Chuyển đổi tất cả ảnh sang WebP (với JPEG fallback)
4. Cấu hình đầy đủ next.config.js cho images
5. Thiết lập art direction cho ảnh hero và ảnh sản phẩm quan trọng
6. Cấu hình CDN và cache policy phù hợp
7. Triển khai blur placeholder cho ảnh sản phẩm

