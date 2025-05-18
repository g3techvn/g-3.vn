# G-3.vn - Website bán nội thất bàn ghế công thái học

Website thương mại điện tử G-3.vn chuyên bán nội thất bàn ghế công thái học, sử dụng Next.js.

## Công nghệ sử dụng

- [Next.js](https://nextjs.org/) - React framework với SSR/SSG/CSR
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

- Authentication đơn giản
- Quản lý sản phẩm theo danh mục, thương hiệu, và tag
- Giỏ hàng và quy trình thanh toán
- Quản lý đơn hàng
- Blog và landing pages

## Cách chạy dự án

### Yêu cầu
- Node.js 18+ 
- npm 9+

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

3. Chạy development server
```bash
npm run dev
```

4. Build cho production
```bash
npm run build
npm start
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Performance Optimizations

The application has been optimized for faster data loading and better user experience:

### Data Fetching Optimizations

1. **Batched API Requests**
   - Reduced multiple network requests by batching API calls
   - Combined related data fetching (brands, categories, etc.) into a single Promise.all operation

2. **Efficient Caching**
   - Implemented a custom useDataCache hook with TTL (Time To Live)
   - Prevents redundant fetches of the same data within a caching window
   - Provides unified loading/error states

3. **Lazy Loading**
   - Used Intersection Observer to load components only when needed
   - Enhanced with larger rootMargin (200px) to preload content before it enters viewport
   - Unobserves sections after first load to prevent duplicate fetching

4. **Progressive Loading**
   - Critical data loads first (brands, categories)
   - Non-critical data (combos, etc.) loads as user scrolls
   - Loading states give visual feedback during data fetching

### Image Optimization

1. **Responsive Images**
   - Created an OptimizedImage component that serves optimal image sizes based on device
   - Uses Next.js Image component with automatic WebP/AVIF format conversion
   - Reduces dimensions by 25% on mobile devices to save bandwidth

2. **Adaptive Quality**
   - Automatically adjusts image quality based on device (75% for mobile, 85% for desktop)
   - Applies appropriate quality levels to different image types (product thumbnails vs. hero images)

3. **Loading Optimizations**
   - Progressive loading with placeholder effect
   - Priority loading for critical above-the-fold images
   - Proper sizing hints with the "sizes" attribute to help browser preloading

4. **Image CDN Configuration**
   - Configured Next.js image optimization with custom device sizes
   - Enabled format detection for modern formats (WebP/AVIF)
   - Set cache TTL to 24 hours for optimal CDN performance

### Advanced Performance Optimizations

1. **Font Optimization**
   - Font display swap for faster initial rendering
   - Preloaded fonts with appropriate font-weight subsets
   - Font fallback system to prevent layout shifts

2. **Service Worker & PWA**
   - Offline support via Service Worker
   - Strategic caching for static assets and images
   - PWA manifest for installable experience
   - Offline fallback page

3. **HTTP Optimizations**
   - Preconnect to critical domains
   - DNS prefetching
   - Optimized cache headers for static assets
   - Security headers (HSTS, Content-Type-Options, etc.)

4. **Bundle Optimizations**
   - Optimized CSS with modern techniques
   - Tree-shaking and dead code elimination
   - Package imports optimization for libraries (lodash, framer-motion)
   - Optimized React server components

### Implementation Details

The caching system uses a hybrid approach:
- In-memory caching with Map for fast access
- React state for reactive UI updates
- TTL-based invalidation to ensure data freshness

The image optimization system:
- Maintains aspect ratios across devices
- Prevents layout shifts with placeholders
- Reduces total page weight by over 60% compared to unoptimized images

The PWA implementation provides:
- Service worker with strategic caching
- Offline capability with fallback UIs
- Install prompts on supported devices
- Fast subsequent loads

### Further Optimization Ideas

- Implement server-side data prefetching
- Add HTTP caching headers for API responses
- Consider using SWR or React Query for more advanced caching
- Implement proper pagination for product lists
- Add art direction for complex image layouts on different devices
- Implement streaming server components
- Use React Server Components for data-heavy pages
