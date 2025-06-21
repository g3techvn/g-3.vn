import type { Metadata } from 'next';
import { COMPANY_INFO, SOCIAL_LINKS } from '@/constants';

// Base URL
const siteUrl = COMPANY_INFO.website;

// Enhanced keywords for better SEO
const seoKeywords = [
  'công thái học',
  'nội thất văn phòng', 
  'ghế ergonomic',
  'bàn điều chỉnh độ cao',
  'ghế làm việc',
  'ghế gaming',
  'ghế massage',
  'nội thất công sở',
  'furniture vietnam',
  'sức khỏe văn phòng',
  'thiết kế công thái học',
  'ghế xoay văn phòng'
];

// Default metadata with enhanced Open Graph for Zalo & social media
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | G3 - Công Thái Học',
    default: 'G3 - Công Thái Học - Nội thất văn phòng với thiết kế công thái học',
  },
  description: `${COMPANY_INFO.name} - Chuyên cung cấp nội thất văn phòng với thiết kế công thái học chất lượng cao. ✓ Bảo hành 12 tháng ✓ Miễn phí giao hàng ✓ Tư vấn 24/7. Hotline: ${COMPANY_INFO.hotline}`,
  keywords: seoKeywords,
  authors: [{ name: 'G3', url: siteUrl }],
  creator: COMPANY_INFO.name,
  publisher: COMPANY_INFO.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: siteUrl,
    siteName: 'G3 - Công Thái Học',
    title: 'G3 - Công Thái Học - Nội thất văn phòng với thiết kế công thái học',
    description: `${COMPANY_INFO.name} - Chuyên cung cấp nội thất văn phòng với thiết kế công thái học chất lượng cao. ✓ Bảo hành 12 tháng ✓ Miễn phí giao hàng ✓ Tư vấn 24/7`,
    images: [
      {
        url: `${siteUrl}/images/header-img.jpg`,
        width: 1822,
        height: 1025,
        alt: 'G3 - Công Thái Học - Nội thất văn phòng chất lượng cao',
      },
      {
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: 'G3 Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@g3vietnam',
    creator: '@g3vietnam',
    title: 'G3 - Công Thái Học - Nội thất văn phòng với thiết kế công thái học',
    description: `${COMPANY_INFO.name} - Chuyên cung cấp nội thất văn phòng với thiết kế công thái học chất lượng cao`,
         images: [
       {
         url: `${siteUrl}/images/header-img.jpg`,
         alt: 'G3 - Công Thái Học - Nội thất văn phòng chất lượng cao',
         width: 1822,
         height: 1025,
       }
     ],
  },
  // Additional meta tags for Zalo and other platforms
  other: {
    // Zalo specific meta tags
    'zalo:app_id': process.env.NEXT_PUBLIC_ZALO_APP_ID || '',
    'zalo:title': 'G3 - Công Thái Học - Nội thất văn phòng với thiết kế công thái học',
    'zalo:description': `${COMPANY_INFO.name} - Chuyên cung cấp nội thất văn phòng với thiết kế công thái học chất lượng cao. ✓ Bảo hành 12 tháng ✓ Miễn phí giao hàng ✓ Tư vấn 24/7`,
         'zalo:image': `${siteUrl}/images/header-img.jpg`,
    'zalo:url': siteUrl,
    
    // Facebook specific meta tags
    'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
    'fb:admins': process.env.NEXT_PUBLIC_FACEBOOK_ADMIN_ID || '',
    
    // Additional Open Graph tags for better social sharing
    'og:locale:alternate': 'en_US',
    'og:rich_attachment': 'true',
    'og:updated_time': new Date().toISOString(),
    
    // WhatsApp Business specific
    'whatsapp:title': 'G3 - Công Thái Học',
    'whatsapp:description': 'Nội thất văn phòng chất lượng cao với thiết kế công thái học',
         'whatsapp:image': `${siteUrl}/images/header-img.jpg`,
    
    // Telegram specific
    'telegram:channel': '@g3vietnam',
    
    // General mobile app meta tags
    'apple-mobile-web-app-title': 'G3 Store',
    'application-name': 'G3 Store',
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': `${siteUrl}/icons/ms-icon-144x144.png`,
    'theme-color': '#ffffff',
    
    // Business contact info for rich snippets
    'contact:phone_number': COMPANY_INFO.hotline,
    'contact:email': COMPANY_INFO.email,
    'contact:street_address': COMPANY_INFO.address,
    'contact:locality': 'Hà Nội',
    'contact:country': 'Vietnam',
    
    // Enhanced SEO meta tags
    'geo.region': 'VN-HN',
    'geo.placename': 'Hà Nội',
    'geo.position': '21.0285;105.8542',
    'ICBM': '21.0285, 105.8542',
    
    // Business schema meta tags
    'business:contact_data:street_address': COMPANY_INFO.address,
    'business:contact_data:locality': 'Hà Nội',
    'business:contact_data:region': 'Hà Nội',
    'business:contact_data:postal_code': '100000',
    'business:contact_data:country_name': 'Vietnam',
    'business:contact_data:email': COMPANY_INFO.email,
    'business:contact_data:phone_number': COMPANY_INFO.hotline,
    'business:contact_data:website': siteUrl,
    
    // E-commerce specific meta tags
    'product:retailer': 'G3 Vietnam',
    'product:condition': 'new',
    'product:availability': 'in stock',
    'product:price:currency': 'VND',
    'product:shipping_cost:currency': 'VND',
    'product:shipping_cost:amount': '0',
    
    // Performance & Security hints
    'dns-prefetch': 'true',
    'preconnect': 'true',
    'prefetch': 'true',
    'preload': 'true',
    
    // Mobile & PWA optimization
    'mobile-web-app-capable': 'yes',
    'mobile-web-app-status-bar-style': 'default',
    'mobile-web-app-title': 'G3 Store',
    'format-detection': 'telephone=no, email=no, address=no',
    
    // Search engine specific
    'googlebot': 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    'bingbot': 'index,follow',
    'slurp': 'index,follow',
    'duckduckbot': 'index,follow',
    
    // Content classification
    'rating': 'general',
    'distribution': 'global',
    'revisit-after': '7 days',
    'expires': 'never',
    'pragma': 'no-cache',
    'cache-control': 'no-cache',
    
    // Social media meta tags
    'pinterest': 'nopin',
    'pinterest-rich-pin': 'true',
  },
  verification: {
    google: 'google-site-verification',
    yandex: 'yandex-verification',
    other: {
      'zalo-site-verification': process.env.NEXT_PUBLIC_ZALO_VERIFICATION || '',
      'facebook-domain-verification': process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION || '',
    }
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'vi-VN': `${siteUrl}`,
      'en-US': `${siteUrl}?lang=en`,
      'x-default': siteUrl,
    },
    types: {
      'application/rss+xml': `${siteUrl}/feed.xml`,
      'application/atom+xml': `${siteUrl}/atom.xml`,
    },
  },
  category: 'furniture',
  classification: 'business',
  referrer: 'origin-when-cross-origin',
  generator: 'Next.js',
  applicationName: 'G3 Store',
  manifest: `${siteUrl}/manifest.json`,
  appleWebApp: {
    capable: true,
    title: 'G3 Store',
    statusBarStyle: 'default',
    startupImage: [
      {
        url: `${siteUrl}/icons/apple-touch-icon.png`,
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
};

// Generate metadata for dynamic paths with enhanced social media support
export function generateMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  productInfo,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  productInfo?: {
    price?: string;
    availability?: string;
    brand?: string;
    category?: string;
  };
}): Metadata {
  const metadata: Metadata = { ...defaultMetadata };
  
  if (title) {
    metadata.title = title;
    if (metadata.openGraph) {
      metadata.openGraph.title = title;
    }
    if (metadata.twitter) {
      metadata.twitter.title = title;
    }
    if (metadata.other) {
      metadata.other['zalo:title'] = title;
      metadata.other['whatsapp:title'] = title;
    }
  }
  
  if (description) {
    metadata.description = description;
    if (metadata.openGraph) {
      metadata.openGraph.description = description;
    }
    if (metadata.twitter) {
      metadata.twitter.description = description;
    }
    if (metadata.other) {
      metadata.other['zalo:description'] = description;
      metadata.other['whatsapp:description'] = description;
    }
  }
  
  if (image && metadata.openGraph) {
    const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
    
    metadata.openGraph.images = [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title || 'G3 Image',
      },
    ];
    
    if (metadata.twitter) {
      metadata.twitter.images = [
        {
          url: imageUrl,
          alt: title || 'G3 Image',
          width: 1200,
          height: 630,
        }
      ];
    }
    
    if (metadata.other) {
      metadata.other['zalo:image'] = imageUrl;
      metadata.other['whatsapp:image'] = imageUrl;
    }
  }
  
  if (url && metadata.openGraph) {
    const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
    metadata.openGraph.url = fullUrl;
    if (metadata.alternates) {
      metadata.alternates.canonical = fullUrl;
    }
    if (metadata.other) {
      metadata.other['zalo:url'] = fullUrl;
    }
  }
  
  // Set Open Graph type  
  if (metadata.openGraph) {
    (metadata.openGraph as Record<string, unknown>).type = type;
  }
  
  // Add product-specific meta tags
  if (productInfo && metadata.other) {
    if (productInfo.price) {
      metadata.other['product:price:amount'] = productInfo.price;
      metadata.other['product:price:currency'] = 'VND';
    }
    if (productInfo.availability) {
      metadata.other['product:availability'] = productInfo.availability;
    }
    if (productInfo.brand) {
      metadata.other['product:brand'] = productInfo.brand;
    }
    if (productInfo.category) {
      metadata.other['product:category'] = productInfo.category;
    }
  }
  
  return metadata;
}