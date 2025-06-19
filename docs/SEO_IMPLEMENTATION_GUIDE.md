# 🚀 HƯỚNG DẪN TRIỂN KHAI SEO NGAY LẬP TỨC - G3.VN

## ⚡ **QUICK START: 30 PHÚT ĐẦU TIÊN**

### **Bước 1: Thêm Script vào package.json** (2 phút)
```json
{
  "scripts": {
    "seo:audit": "node scripts/seo-audit.js",
    "seo:validate": "npm run build && npm run seo:audit"
  }
}
```

### **Bước 2: Integrate Structured Data vào Product Pages** (15 phút)

#### **Update Product Detail Page**
```typescript
// src/app/san-pham/[slug]/page.tsx
import { ProductJsonLd } from '@/components/SEO/ProductJsonLd';
import { BreadcrumbJsonLd, generateBreadcrumbItems } from '@/components/SEO/BreadcrumbJsonLd';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // ... existing code ...

  return (
    <>
      {/* SEO Structured Data */}
      {product && (
        <>
          <ProductJsonLd 
            product={product}
            brand={brand}
            reviews={comments.map(c => ({
              id: c.id,
              rating: c.rating,
              author: c.user.name,
              datePublished: c.date,
              reviewBody: c.content
            }))}
            availability="InStock"
          />
          <BreadcrumbJsonLd 
            items={generateBreadcrumbItems(`/san-pham/${slug}`, product.name)}
          />
        </>
      )}

      {/* Existing UI components */}
      <div className="md:hidden">
        <MobileShopeeProductDetail {...mobileProps} />
      </div>
      
      <div className="hidden md:block">
        <ProductDetailDesktop {...desktopProps} />
      </div>
    </>
  );
}
```

### **Bước 3: Add Organization Schema to Layout** (5 phút)

```typescript
// src/app/layout.tsx
import { OrganizationJsonLd } from '@/components/SEO/OrganizationJsonLd';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd 
          contact={{
            phone: "+84-xxx-xxx-xxx",
            email: "info@g-3.vn",
            address: "TP. Hồ Chí Minh"
          }}
          social={{
            facebook: "https://facebook.com/g3vietnam",
            youtube: "https://youtube.com/@g3vietnam"
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

### **Bước 4: Optimize Alt Tags** (8 phút)

```typescript
// src/components/common/OptimizedImage.tsx (tạo mới)
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  productName?: string;
  category?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  productName,
  category,
  width = 400,
  height = 400,
  priority = false,
  className = ""
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);

  // Generate SEO-optimized alt text
  const optimizedAlt = productName && category 
    ? `${productName} - ${category} chất lượng cao | G3`
    : alt || 'Sản phẩm G3';

  return (
    <Image
      src={imageError ? '/images/placeholder-product.jpg' : src}
      alt={optimizedAlt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      onError={() => setImageError(true)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

---

## 🎯 **TRIỂN KHAI THEO TỪNG TUẦN**

### **TUẦN 1: STRUCTURED DATA FOUNDATION**

#### **Day 1-2: Product Schema**
```bash
# Cài đặt dependencies
npm install schema-dts

# Test implementation
npm run seo:audit
```

#### **Day 3-4: Category & Brand Pages**
```typescript
// src/app/categories/[slug]/page.tsx
import { BreadcrumbJsonLd, generateBreadcrumbItems } from '@/components/SEO/BreadcrumbJsonLd';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  
  return (
    <>
      <BreadcrumbJsonLd 
        items={generateBreadcrumbItems(`/categories/${slug}`, undefined, categoryName)}
      />
      {/* Rest of component */}
    </>
  );
}
```

#### **Day 5-7: Content Pages**
```typescript
// components/SEO/FAQJsonLd.tsx
export function FAQJsonLd({ faqs }: { faqs: Array<{question: string, answer: string}> }) {
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
```

### **TUẦN 2: METADATA OPTIMIZATION**

#### **Enhanced Meta Descriptions**
```typescript
// src/lib/seo-utils.ts
export function generateProductMeta(product: Product, brand?: Brand) {
  const brandName = brand?.title || 'G3';
  const features = product.tinh_nang ? 
    (Array.isArray(product.tinh_nang) ? product.tinh_nang.slice(0, 2) : [product.tinh_nang]) 
    : [];
  
  return {
    title: `${product.name} | ${brandName} | G3 - Công Thái Học`,
    description: `${product.name} ${features.join(', ')} ✓ Miễn phí vận chuyển ✓ Bảo hành 12 tháng ✓ Hỗ trợ 24/7. Giá tốt nhất: ${product.price.toLocaleString()}đ`,
    keywords: [
      product.name.toLowerCase(),
      'ghế công thái học',
      brandName.toLowerCase(),
      'nội thất văn phòng',
      'ergonomic chair',
      ...features.map(f => f.toLowerCase())
    ],
    image: product.image_url,
    url: `/san-pham/${product.slug}`
  };
}
```

#### **Category Meta Generation**
```typescript
export function generateCategoryMeta(category: Category, products: Product[]) {
  const productCount = products.length;
  const priceRange = products.length > 0 ? {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  } : null;

  return {
    title: `${category.name} - ${productCount} sản phẩm | G3 - Công Thái Học`,
    description: `Khám phá ${productCount} ${category.name.toLowerCase()} chất lượng cao${priceRange ? ` từ ${priceRange.min.toLocaleString()}đ - ${priceRange.max.toLocaleString()}đ` : ''}. ✓ Thiết kế công thái học ✓ Bảo hành chính hãng ✓ Miễn phí giao hàng.`,
    keywords: [
      category.name.toLowerCase(),
      'công thái học',
      'nội thất văn phòng',
      'ergonomic furniture'
    ]
  };
}
```

### **TUẦN 3: CONTENT STRATEGY**

#### **Blog Implementation**
```typescript
// src/app/blog/page.tsx
import { generateMetadata } from '@/app/metadata';

export const metadata = generateMetadata({
  title: 'Blog - Kiến thức công thái học',
  description: 'Cẩm nang kiến thức về công thái học, sức khỏe văn phòng và tối ưu không gian làm việc. Cập nhật xu hướng nội thất 2024.',
  url: '/blog'
});

// Blog post schema
const blogPostSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "G3 Blog - Kiến thức công thái học",
  "description": "Blog chuyên về kiến thức công thái học và sức khỏe văn phòng",
  "url": "https://g-3.vn/blog",
  "author": {
    "@type": "Organization",
    "name": "G3 - Công Thái Học"
  }
};
```

#### **Content Templates**
```markdown
# Template for Blog Posts

## SEO-Optimized Blog Post Structure:

### H1: Main Keyword (1 per page)
"5 Dấu hiệu bạn cần ghế công thái học ngay lập tức"

### H2: Secondary Keywords
- "Tại sao ghế văn phòng thường gây đau lưng?"
- "Lợi ích của ghế công thái học cho sức khỏe"
- "Cách chọn ghế công thái học phù hợp"

### Content Requirements:
- Length: 1500-2500 words
- Keywords density: 1-2%
- Internal links: 3-5 per post
- External links: 1-2 authority sites
- Images: 3-5 with optimized alt tags
- Call-to-action: 1-2 per post
```

### **TUẦN 4: TECHNICAL ENHANCEMENTS**

#### **Pagination SEO**
```typescript
// components/SEO/PaginationMeta.tsx
'use client';

import Head from 'next/head';

interface PaginationMetaProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function PaginationMeta({ currentPage, totalPages, baseUrl }: PaginationMetaProps) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <Head>
      {prevPage && (
        <link
          rel="prev"
          href={`${baseUrl}?page=${prevPage}`}
        />
      )}
      {nextPage && (
        <link
          rel="next"
          href={`${baseUrl}?page=${nextPage}`}
        />
      )}
      <link
        rel="canonical"
        href={currentPage === 1 ? baseUrl : `${baseUrl}?page=${currentPage}`}
      />
    </Head>
  );
}
```

#### **Enhanced Sitemap**
```typescript
// src/app/server-sitemap.xml/route.ts - Enhanced version
export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Enhanced product priority based on multiple factors
    const { data: products } = await supabase
      .from('products')
      .select(`
        slug,
        updated_at,
        created_at,
        price,
        sold_count,
        rating
      `);
    
    const productFields = products?.map(product => {
      const now = new Date();
      const createdAt = new Date(product.created_at);
      const daysSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Dynamic priority calculation
      let priority = 0.7; // Base priority
      
      // Boost for new products
      if (daysSinceCreated <= 30) priority += 0.2;
      
      // Boost for popular products
      if (product.sold_count > 100) priority += 0.1;
      if (product.rating >= 4.5) priority += 0.1;
      
      // Boost for high-value products
      if (product.price > 5000000) priority += 0.05;
      
      priority = Math.min(priority, 1.0); // Cap at 1.0
      
      return {
        loc: `https://g-3.vn/san-pham/${product.slug}`,
        lastmod: product.updated_at || product.created_at,
        changefreq: daysSinceCreated <= 7 ? 'daily' : 
                   daysSinceCreated <= 30 ? 'weekly' : 'monthly',
        priority: priority.toFixed(1)
      };
    }) || [];

    return getServerSideSitemap(productFields);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
```

---

## 📈 **MONITORING & MEASUREMENT**

### **Setup Google Search Console**
```typescript
// components/SEO/GoogleSearchConsole.tsx
export function GoogleSearchConsole() {
  return (
    <>
      <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXX');
          `
        }}
      />
    </>
  );
}
```

### **SEO Performance Tracking**
```typescript
// lib/seo-analytics.ts
export function trackSEOEvents() {
  // Track page views
  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href
  });

  // Track internal link clicks
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
      gtag('event', 'internal_link_click', {
        link_url: target.getAttribute('href'),
        link_text: target.textContent
      });
    }
  });
}
```

---

## 🎯 **IMMEDIATE ACTIONS CHECKLIST**

### **✅ Week 1 Tasks:**
- [ ] Install structured data components
- [ ] Add ProductJsonLd to product pages
- [ ] Add OrganizationJsonLd to layout
- [ ] Implement BreadcrumbJsonLd
- [ ] Run SEO audit: `npm run seo:audit`

### **✅ Week 2 Tasks:**
- [ ] Optimize all meta descriptions
- [ ] Add OptimizedImage component
- [ ] Update alt tags for existing images
- [ ] Implement category meta generation
- [ ] Test with Google Rich Results Test

### **✅ Week 3 Tasks:**
- [ ] Create blog structure
- [ ] Write first 5 blog posts
- [ ] Implement FAQ schema
- [ ] Setup internal linking strategy
- [ ] Add video schema for YouTube content

### **✅ Week 4 Tasks:**
- [ ] Implement pagination SEO
- [ ] Enhanced sitemap generation
- [ ] Setup Google Search Console
- [ ] Configure Google Analytics 4
- [ ] Performance monitoring setup

---

## 📊 **EXPECTED RESULTS**

### **Month 1:**
- **SEO Score**: 78 → 85 (+9%)
- **Indexed Pages**: +50%
- **Rich Snippets**: First appearances
- **Mobile Usability**: 100% compliance

### **Month 2:**
- **Organic Traffic**: +25%
- **Keyword Rankings**: Top 10 for 5+ terms
- **Click-through Rate**: +15%
- **Core Web Vitals**: All green

### **Month 3:**
- **Organic Traffic**: +40%
- **Featured Snippets**: 3-5 appearances
- **Local Rankings**: Top 5 positions
- **Brand Searches**: +30%

---

## 🚨 **CRITICAL SUCCESS FACTORS**

### **1. Content Quality**
- Write for users first, search engines second
- Answer real customer questions
- Use natural language and Vietnamese SEO best practices

### **2. Technical Excellence**
- Maintain fast loading speeds
- Ensure mobile-first design
- Monitor Core Web Vitals regularly

### **3. Consistent Implementation**
- Follow the weekly schedule
- Test every change
- Monitor search console weekly

### **4. Local SEO Focus**
- Target Vietnamese keywords
- Optimize for local search behavior
- Engage with Vietnamese market trends

---

**🎯 Next Steps**: Start with Week 1 tasks immediately. Run the SEO audit script weekly to track progress.

**⏰ Timeline**: 85/100 SEO score achievable within 1 month with consistent implementation.

*Generated: ${new Date().toLocaleDateString('vi-VN')}* 