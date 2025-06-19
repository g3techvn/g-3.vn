import { Product, Brand } from '@/types';

interface ReviewItem {
  rating: number;
  [key: string]: unknown;
}

// Enhanced metadata generation for products
export function generateProductMeta(product: Product, brand?: Brand) {
  const brandName = brand?.title || 'G3';
  const features = product.tinh_nang ? 
    (Array.isArray(product.tinh_nang) ? product.tinh_nang.slice(0, 2) : [product.tinh_nang]) 
    : [];
  
  // Create compelling description with benefits
  const benefits = [
    'Miễn phí vận chuyển',
    'Bảo hành 12 tháng', 
    'Hỗ trợ 24/7',
    'Thiết kế công thái học'
  ];

  const description = features.length > 0 
    ? `${product.name} ${features.join(', ')} ✓ ${benefits.slice(0, 3).join(' ✓ ')}. Giá tốt nhất: ${product.price.toLocaleString()}đ`
    : `${product.name} - ${benefits.join(' ✓ ')}. Chất lượng cao từ ${brandName}. Giá: ${product.price.toLocaleString()}đ`;

  return {
    title: `${product.name} | ${brandName} | G3 - Công Thái Học`,
    description: description.slice(0, 160), // Limit for SEO
    keywords: [
      product.name.toLowerCase(),
      'ghế công thái học',
      brandName.toLowerCase(),
      'nội thất văn phòng',
      'ergonomic chair',
      ...features.map(f => f.toLowerCase()),
      'sức khỏe văn phòng',
      'ghế làm việc'
    ],
    image: product.image_url,
    url: `/san-pham/${product.slug}`
  };
}

// Enhanced metadata generation for categories
export function generateCategoryMeta(categoryName: string, products: Product[], categorySlug?: string) {
  const productCount = products.length;
  const priceRange = products.length > 0 ? {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  } : null;

  const priceText = priceRange 
    ? ` từ ${priceRange.min.toLocaleString()}đ - ${priceRange.max.toLocaleString()}đ`
    : '';

  const description = `Khám phá ${productCount} ${categoryName.toLowerCase()} chất lượng cao${priceText}. ✓ Thiết kế công thái học ✓ Bảo hành chính hãng ✓ Miễn phí giao hàng. Tư vấn miễn phí 24/7.`;

  return {
    title: `${categoryName} - ${productCount} sản phẩm | G3 - Công Thái Học`,
    description: description.slice(0, 160),
    keywords: [
      categoryName.toLowerCase(),
      'công thái học',
      'nội thất văn phòng',
      'ergonomic furniture',
      'sức khỏe văn phòng',
      'ghế làm việc',
      'bàn làm việc'
    ],
    url: categorySlug ? `/categories/${categorySlug}` : '/categories'
  };
}

// Enhanced metadata generation for brands
export function generateBrandMeta(brand: Brand, products: Product[]) {
  const productCount = products.length;
  const description = `${brand.title} - ${productCount} sản phẩm nội thất công thái học chính hãng. ✓ Chất lượng cao ✓ Giá tốt nhất ✓ Bảo hành toàn diện. Khám phá ngay!`;

  return {
    title: `${brand.title} - ${productCount} sản phẩm | G3 - Công Thái Học`,
    description: description.slice(0, 160),
    keywords: [
      brand.title.toLowerCase(),
      'công thái học',
      'nội thất văn phòng',
      brand.title.toLowerCase() + ' chính hãng',
      'ergonomic furniture'
    ],
    image: brand.image_url || brand.image_square_url,
    url: `/brands/${brand.slug}`
  };
}

// Generate JSON-LD structured data for products
export function generateProductJsonLd(product: Product, brand?: Brand, reviews?: ReviewItem[]) {
  const organizationName = "G3 - Công Thái Học";
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - Sản phẩm công thái học chất lượng cao từ G3`,
    "image": [product.image_url, product.image_square_url].filter(Boolean),
    "brand": {
      "@type": "Brand",
      "name": brand?.title || "G3"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": organizationName
    },
    "offers": {
      "@type": "Offer",
      "url": `https://g-3.vn/san-pham/${product.slug}`,
      "priceCurrency": "VND",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": organizationName,
        "url": "https://g-3.vn"
      }
    },
    "category": product.category_name || "Nội thất văn phòng",
    "sku": product.id,
    ...(reviews && reviews.length > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
        "reviewCount": reviews.length
      }
    })
  };
}

// Generate breadcrumb items from pathname
export function generateBreadcrumbItems(pathname: string, productName?: string, categoryName?: string, brandName?: string) {
  const items = [{ name: 'Trang chủ', item: '/' }];
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return items;

  switch (pathSegments[0]) {
    case 'san-pham':
      items.push({ name: 'Sản phẩm', item: '/san-pham' });
      if (pathSegments[1] && productName) {
        items.push({ name: productName, item: pathname });
      }
      break;
      
    case 'categories':
      items.push({ name: 'Danh mục', item: '/categories' });
      if (pathSegments[1] && categoryName) {
        items.push({ name: categoryName, item: pathname });
      }
      break;
      
    case 'brands':
      items.push({ name: 'Thương hiệu', item: '/brands' });
      if (pathSegments[1] && brandName) {
        items.push({ name: brandName, item: pathname });
      }
      break;
      
    case 'lien-he':
      items.push({ name: 'Liên hệ', item: '/lien-he' });
      break;
      
    case 'about':
      items.push({ name: 'Giới thiệu', item: '/about' });
      break;
      
    case 'uu-dai':
      items.push({ name: 'Ưu đãi', item: '/uu-dai' });
      break;
      
    case 'noi-dung':
      items.push({ name: 'Nội dung', item: '/noi-dung' });
      if (pathSegments[1]) {
        const policyTitles: Record<string, string> = {
          'chinh-sach-bao-hanh-g3': 'Chính sách bảo hành',
          'chinh-sach-bao-mat-g3': 'Chính sách bảo mật',
          'chinh-sach-doi-tra-g3': 'Chính sách đổi trả',
          'chinh-sach-thanh-toan-g3': 'Chính sách thanh toán',
          'chinh-sach-van-chuyen-g3': 'Chính sách vận chuyển',
          'chinh-sach-kiem-hang-g3': 'Chính sách kiểm hàng'
        };
        const policyTitle = policyTitles[pathSegments[1]] || 
                           pathSegments[1].split('-').map(word => 
                             word.charAt(0).toUpperCase() + word.slice(1)
                           ).join(' ');
        items.push({ name: policyTitle, item: pathname });
      }
      break;
      
    default:
      const pageName = pathSegments[0].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      items.push({ name: pageName, item: pathname });
  }

  return items;
}

// SEO-friendly URL slug generator
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[áàạảãâấầậẩẫăắằặẳẵ]/g, 'a')
    .replace(/[éèẹẻẽêếềệểễ]/g, 'e')
    .replace(/[íìịỉĩ]/g, 'i')
    .replace(/[óòọỏõôốồộổỗơớờợởỡ]/g, 'o')
    .replace(/[úùụủũưứừựửữ]/g, 'u')
    .replace(/[ýỳỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Meta description optimizer
export function optimizeMetaDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  
  // Find last complete sentence or phrase within limit
  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastPeriod > maxLength * 0.8) {
    return truncated.slice(0, lastPeriod + 1);
  }
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// Generate keywords from content
export function extractKeywords(content: string, additionalKeywords: string[] = []): string[] {
  const commonWords = ['và', 'của', 'với', 'cho', 'từ', 'tại', 'này', 'có', 'là', 'được', 'một', 'các', 'để', 'trong', 'trên', 'về'];
  
  const words = content
    .toLowerCase()
    .replace(/[^\w\sáàạảãâấầậẩẫăắằặẳẵéèẹẻẽêếềệểễíìịỉĩóòọỏõôốồộổỗơớờợởỡúùụủũưứừựửữýỳỵỷỹđ]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));
  
  const keywordCounts: Record<string, number> = {};
  words.forEach(word => {
    keywordCounts[word] = (keywordCounts[word] || 0) + 1;
  });
  
  const topKeywords = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  return [...new Set([...additionalKeywords, ...topKeywords])];
} 