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

/**
 * Advanced SEO Utilities for G3 E-commerce Platform
 * Auto-generates SEO-optimized content for better search rankings
 */

interface ProductSEOData {
  name: string;
  category?: string;
  brand?: string;
  price?: number;
  features?: string[];
  color?: string;
  material?: string;
  size?: string;
}

interface CategorySEOData {
  name: string;
  productCount?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  topBrands?: string[];
}

/**
 * Generates SEO-optimized alt text for product images
 */
export function generateProductAltTag(
  product: ProductSEOData,
  imageType: 'main' | 'gallery' | 'thumbnail' | 'detail' = 'main'
): string {
  const { name, category, brand, features, color, material } = product;
  
  // Base alt text components
  const components: string[] = [];
  
  // Add product name (always first)
  components.push(name);
  
  // Add category context
  if (category) {
    components.push(category.toLowerCase());
  }
  
  // Add brand for credibility
  if (brand) {
    components.push(brand);
  }
  
  // Add material/color for specificity
  if (material) {
    components.push(`chất liệu ${material.toLowerCase()}`);
  }
  
  if (color) {
    components.push(`màu ${color.toLowerCase()}`);
  }
  
  // Add key features (max 2)
  if (features && features.length > 0) {
    const keyFeatures = features.slice(0, 2).map(f => f.toLowerCase());
    components.push(...keyFeatures);
  }
  
  // Add image type context
  const typeContext = {
    main: 'chính',
    gallery: 'chi tiết',
    thumbnail: 'xem trước',
    detail: 'cận cảnh'
  };
  
  // Add quality indicators
  const qualityIndicators = [
    'chất lượng cao',
    'thiết kế hiện đại',
    'tại G3 Vietnam'
  ];
  
  // Construct final alt text
  let altText = components.join(' ');
  
  // Add type context if not main image
  if (imageType !== 'main') {
    altText += ` - ảnh ${typeContext[imageType]}`;
  }
  
  // Add quality indicator
  altText += ` ${qualityIndicators[Math.floor(Math.random() * qualityIndicators.length)]}`;
  
  // Ensure proper length (max 125 characters for optimal SEO)
  if (altText.length > 125) {
    altText = altText.substring(0, 122) + '...';
  }
  
  return altText;
}

/**
 * Generates SEO-optimized meta description for product pages
 */
export function generateProductMetaDescription(
  product: ProductSEOData & { description?: string }
): string {
  const { name, category, brand, price, features, description } = product;
  
  // Start with product name and category
  let metaDesc = `${name}`;
  
  if (category) {
    metaDesc += ` - ${category}`;
  }
  
  if (brand) {
    metaDesc += ` ${brand}`;
  }
  
  // Add key selling points
  const sellingPoints = [
    '✓ Bảo hành chính hãng 12 tháng',
    '✓ Miễn phí giao hàng toàn quốc',
    '✓ Tư vấn 24/7'
  ];
  
  // Add price if available
  if (price) {
    metaDesc += `. Giá ${price.toLocaleString()}₫.`;
  }
  
  // Add features (max 3)
  if (features && features.length > 0) {
    const keyFeatures = features.slice(0, 3);
    metaDesc += ` Tính năng: ${keyFeatures.join(', ')}.`;
  }
  
  // Add selling points
  metaDesc += ` ${sellingPoints.join(' ')}`;
  
  // Add call to action
  metaDesc += ' Đặt hàng ngay tại G3!';
  
  // Ensure proper length (max 160 characters)
  if (metaDesc.length > 160) {
    metaDesc = metaDesc.substring(0, 157) + '...';
  }
  
  return metaDesc;
}

/**
 * Generates SEO-optimized meta description for category pages
 */
export function generateCategoryMetaDescription(
  category: CategorySEOData
): string {
  const { name, productCount, priceRange, topBrands } = category;
  
  let metaDesc = `Mua ${name.toLowerCase()} chất lượng cao tại G3`;
  
  // Add product count
  if (productCount) {
    metaDesc += ` với ${productCount}+ sản phẩm`;
  }
  
  // Add price range
  if (priceRange) {
    metaDesc += ` từ ${priceRange.min.toLocaleString()}₫ - ${priceRange.max.toLocaleString()}₫`;
  }
  
  // Add top brands
  if (topBrands && topBrands.length > 0) {
    metaDesc += `. Thương hiệu: ${topBrands.slice(0, 3).join(', ')}`;
  }
  
  // Add selling points
  metaDesc += '. ✓ Bảo hành 12 tháng ✓ Giao hàng miễn phí ✓ Tư vấn 24/7';
  
  // Ensure proper length
  if (metaDesc.length > 160) {
    metaDesc = metaDesc.substring(0, 157) + '...';
  }
  
  return metaDesc;
}

/**
 * Generates SEO-friendly URL slug
 */
export function generateSEOSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Vietnamese characters
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    // Replace spaces and special characters
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-');
}

/**
 * Generates structured data keywords for better SEO
 */
export function generateSEOKeywords(
  product: ProductSEOData
): string[] {
  const { name, category, brand, features } = product;
  
  const keywords: string[] = [];
  
  // Add product name variations
  keywords.push(name.toLowerCase());
  keywords.push(`mua ${name.toLowerCase()}`);
  keywords.push(`${name.toLowerCase()} giá rẻ`);
  
  // Add category keywords
  if (category) {
    keywords.push(category.toLowerCase());
    keywords.push(`${category.toLowerCase()} chất lượng`);
    keywords.push(`${category.toLowerCase()} tốt nhất`);
  }
  
  // Add brand keywords
  if (brand) {
    keywords.push(`${brand.toLowerCase()}`);
    keywords.push(`${name.toLowerCase()} ${brand.toLowerCase()}`);
  }
  
  // Add feature-based keywords
  if (features) {
    features.forEach(feature => {
      keywords.push(feature.toLowerCase());
      keywords.push(`${feature.toLowerCase()} ${category?.toLowerCase() || ''}`);
    });
  }
  
  // Add location-based keywords
  const locations = ['hà nội', 'hcm', 'việt nam', 'toàn quốc'];
  locations.forEach(location => {
    keywords.push(`${name.toLowerCase()} ${location}`);
  });
  
  // Add commercial keywords
  const commercial = [
    'bảo hành',
    'chính hãng',
    'giá tốt',
    'khuyến mãi',
    'giao hàng miễn phí'
  ];
  commercial.forEach(term => {
    keywords.push(`${name.toLowerCase()} ${term}`);
  });
  
  // Remove duplicates and return
  return [...new Set(keywords)];
}

/**
 * Generates Open Graph title optimized for social sharing
 */
export function generateOGTitle(
  title: string,
  type: 'product' | 'category' | 'brand' | 'general' = 'general'
): string {
  const prefixes = {
    product: '🛒',
    category: '📂',
    brand: '🏢',
    general: '🏠'
  };
  
  const suffix = ' | G3 - Công Thái Học';
  const prefix = prefixes[type];
  
  let ogTitle = `${prefix} ${title}`;
  
  // Ensure proper length for social media (max 60 characters)
  const maxLength = 60 - suffix.length;
  if (ogTitle.length > maxLength) {
    ogTitle = ogTitle.substring(0, maxLength - 3) + '...';
  }
  
  return ogTitle + suffix;
}

/**
 * Validates and optimizes meta tags for SEO compliance
 */
export function validateSEOMetaTags(meta: {
  title?: string;
  description?: string;
  keywords?: string[];
}) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Title validation
  if (!meta.title) {
    issues.push('Missing title tag');
  } else {
    if (meta.title.length < 30) {
      recommendations.push('Title too short (recommended: 30-60 characters)');
    }
    if (meta.title.length > 60) {
      recommendations.push('Title too long (recommended: 30-60 characters)');
    }
  }
  
  // Description validation
  if (!meta.description) {
    issues.push('Missing meta description');
  } else {
    if (meta.description.length < 120) {
      recommendations.push('Description too short (recommended: 120-160 characters)');
    }
    if (meta.description.length > 160) {
      recommendations.push('Description too long (recommended: 120-160 characters)');
    }
  }
  
  // Keywords validation
  if (!meta.keywords || meta.keywords.length === 0) {
    recommendations.push('Consider adding relevant keywords');
  } else if (meta.keywords.length > 10) {
    recommendations.push('Too many keywords (recommended: 5-10 focused keywords)');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations,
    score: Math.max(0, 100 - (issues.length * 20) - (recommendations.length * 5))
  };
} 