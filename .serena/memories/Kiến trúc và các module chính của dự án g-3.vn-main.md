Dự án g-3.vn-main là một hệ thống web phức tạp, sử dụng Next.js với cấu trúc thư mục rõ ràng, chia thành nhiều module chức năng:

- src/app: Chứa các route, trang, API endpoint, layout, và các trang quản trị (admin), sản phẩm, đơn hàng, v.v.
- src/components: Chứa các component UI cho admin, common, features (auth, cart, product, rewards), layout, mobile, pc, SEO, store, ui, v.v.
- src/lib: Chứa các thư viện core như bảo mật (security), xác thực (auth), quản lý location, logger, API, supabase, rate-limit, validation, v.v.
- src/features: Chứa các provider và logic cho auth, cart, product.
- src/hooks: Chứa các custom React hooks cho data fetching, state, media query, v.v.
- src/types: Định nghĩa các kiểu dữ liệu cho rewards, orders, cart, supabase, v.v.
- src/utils: Chứa các hàm tiện ích như format, analytics, image optimizer, helpers, v.v.

Các module bảo mật, xác thực, quản lý location, SEO, và tối ưu hóa hiệu năng đều được tách riêng, dễ bảo trì và mở rộng. Hệ thống sử dụng Supabase cho backend/database, có các schema, validation, và rate-limit rõ ràng. Các component UI được chia cho mobile/pc, hỗ trợ responsive.

English:
The g-3.vn-main project is a complex web system using Next.js, with a clear folder structure and modular separation:

- src/app: Contains routes, pages, API endpoints, layouts, admin pages, product/order pages, etc.
- src/components: UI components for admin, common, features (auth, cart, product, rewards), layout, mobile, pc, SEO, store, ui, etc.
- src/lib: Core libraries for security, authentication, location management, logger, API, supabase, rate-limit, validation, etc.
- src/features: Providers and logic for auth, cart, product.
- src/hooks: Custom React hooks for data fetching, state, media query, etc.
- src/types: Type definitions for rewards, orders, cart, supabase, etc.
- src/utils: Utility functions for formatting, analytics, image optimization, helpers, etc.

Security, authentication, location management, SEO, and performance optimization modules are separated for maintainability and scalability. The system uses Supabase for backend/database, with clear schema, validation, and rate-limiting. UI components are split for mobile/pc, supporting responsive design.