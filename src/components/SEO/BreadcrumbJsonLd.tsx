'use client';

interface BreadcrumbItem {
  name: string;
  item: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item.startsWith('http') ? item.item : `https://g-3.vn${item.item}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ 
        __html: JSON.stringify(breadcrumbSchema, null, 2) 
      }}
    />
  );
}

// Helper function to generate breadcrumb items from pathname
export function generateBreadcrumbItems(pathname: string, productName?: string, categoryName?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: 'Trang chủ', item: '/' }
  ];

  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return items;
  }

  // Handle different page types
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
      if (pathSegments[1]) {
        // Capitalize brand name
        const brandName = pathSegments[1].split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
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
        const policyTitles = {
          'chinh-sach-bao-hanh-g3': 'Chính sách bảo hành',
          'chinh-sach-bao-mat-g3': 'Chính sách bảo mật',
          'chinh-sach-doi-tra-g3': 'Chính sách đổi trả',
          'chinh-sach-thanh-toan-g3': 'Chính sách thanh toán',
          'chinh-sach-van-chuyen-g3': 'Chính sách vận chuyển',
          'chinh-sach-kiem-hang-g3': 'Chính sách kiểm hàng'
        };
        const policyTitle = policyTitles[pathSegments[1] as keyof typeof policyTitles] || 
                           pathSegments[1].split('-').join(' ');
        items.push({ name: policyTitle, item: pathname });
      }
      break;
      
    default:
      // For other pages, create a generic breadcrumb
      const pageName = pathSegments[0].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      items.push({ name: pageName, item: pathname });
  }

  return items;
} 