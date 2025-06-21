# G3-TECH - Ghế Gaming & Thiết Bị Văn Phòng

Website thương mại điện tử chuyên bán ghế gaming và thiết bị văn phòng ergonomic.

## 🚀 Quick Start

```bash
# Clone repository
git clone [repository-url]
cd g-3.vn-main

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.1 (App Router), React 19.0.0, TypeScript 5+
- **UI**: Ant Design 5.26.0, Radix UI, Tailwind CSS 4.1.5
- **State**: TanStack React Query 5.75.5, Context API
- **Backend**: Supabase 2.49.4 (PostgreSQL + Storage + Auth)
- **Security**: Rate limiting, auth middleware, CSP headers
- **Performance**: Bundle optimization, image optimization (WebP/AVIF), sold count optimization
- **SEO**: 6 structured data components, automatic sitemap
- **PWA**: Service worker, manifest, offline support

## 📚 Documentation

**📖 Complete Project Guide**: [`docs/project-note.md`](docs/project-note.md)

Includes:
- Project structure & tech stack
- Performance optimizations (sold count, caching, API)
- SEO implementation & structured data
- Error handling & monitoring
- Development best practices

## 🧪 Testing

### **Performance Testing**
```bash
# Access sold count optimization test
open http://localhost:3000/admin/sold-count-test

# API performance comparison
curl "http://localhost:3000/api/products/sold-counts-optimized"
```

## 📁 Project Structure

```
g-3.vn-main/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities and configurations
├── scripts/                # Database migration and setup scripts
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 📊 Recent Optimizations

- ⚡ **Performance**: 75-90% API improvement (categories), 28%+ sold count optimization
- 🖼️ **Image Optimization**: WebP/AVIF support, CDN integration, lazy loading
- 🛡️ **Security**: Rate limiting, auth middleware, suspicious activity detection
- 🔄 **Caching Strategy**: Intelligent TTL (3-30 min), 80% cache hit ratio
- 🔍 **SEO**: 6 structured data types, dynamic metadata, auto-sitemap
- 📱 **PWA**: Service worker, offline support, manifest configuration
- 🛠️ **Error Handling**: Comprehensive validation, toast notifications, retry logic

## 🔧 Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run type-check   # TypeScript checking
```

---

**🎯 Current Focus**: Component migration to optimized sold count system
