# G-3.vn - Website bán nội thất bàn ghế công thái học

Website thương mại điện tử G-3.vn chuyên bán nội thất bàn ghế công thái học, sử dụng Next.js và Supabase.

## Công nghệ sử dụng

- [Next.js](https://nextjs.org/) - React framework với SSR/SSG/CSR
- [Supabase](https://supabase.io/) - Backend as a Service (Auth, Database, Storage)
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
- [React Query](https://tanstack.com/query/latest) - Data fetching và state management
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://zod.dev/) - Schema validation
- [Axios](https://axios-http.com/) - HTTP client
- [Lodash](https://lodash.com/) - Thư viện tiện ích
- [Day.js](https://day.js.org/) - Xử lý, format ngày giờ

## Cấu trúc dự án

```
g-3.vn/
├── public/                 # Ảnh, favicon, static files
├── src/
│   ├── app/                # App router của Next.js 
│   ├── components/         # Các component dùng lại
│   ├── features/           # Module tính năng theo domain
│   │   ├── product/        # Quản lý sản phẩm
│   │   ├── category/       # Quản lý danh mục
│   │   ├── brand/          # Quản lý thương hiệu
│   │   ├── tag/            # Quản lý tag
│   │   ├── cart/           # Quản lý giỏ hàng
│   │   ├── order/          # Quản lý đơn hàng
│   │   ├── user/           # Quản lý thông tin người dùng
│   │   └── auth/           # Authentication
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Khởi tạo thư viện, clients 
│   ├── types/              # TypeScript types và interfaces
│   └── utils/              # Utility functions
```

## Tính năng chính

- Authentication với Supabase Auth
- Quản lý sản phẩm theo danh mục, thương hiệu, và tag
- Giỏ hàng và quy trình thanh toán
- Quản lý đơn hàng
- Blog và landing pages

## Cách chạy dự án

### Yêu cầu
- Node.js 18+ 
- npm 9+
- Tài khoản Supabase (để lấy API keys)

### Các bước

1. Clone repository
```bash
git clone https://github.com/yourusername/g-3.vn.git
cd g-3.vn
```

2. Cài đặt dependencies
```bash
npm install
```

3. Cấu hình biến môi trường
Tạo file `.env.local` và thêm:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Chạy development server
```bash
npm run dev
```

5. Build cho production
```bash
npm run build
npm start
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
