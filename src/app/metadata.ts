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

// Default metadata
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
        url: `${siteUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'G3 - Công Thái Học Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'G3 - Công Thái Học - Nội thất văn phòng với thiết kế công thái học',
    description: `${COMPANY_INFO.name} - Chuyên cung cấp nội thất văn phòng với thiết kế công thái học chất lượng cao`,
    images: [`${siteUrl}/logo.png`],
    creator: '@g3vietnam',
  },
  verification: {
    google: 'google-site-verification',
    yandex: 'yandex-verification',
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'vi-VN': `${siteUrl}`,
    },
  },
};

// Generate metadata for dynamic paths
export function generateMetadata({
  title,
  description,
  image,
  url,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
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
  }
  
  if (description) {
    metadata.description = description;
    if (metadata.openGraph) {
      metadata.openGraph.description = description;
    }
    if (metadata.twitter) {
      metadata.twitter.description = description;
    }
  }
  
  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: image.startsWith('http') ? image : `${siteUrl}${image}`,
        width: 800,
        height: 600,
        alt: title || 'G3 Image',
      },
    ];
    
    if (metadata.twitter) {
      metadata.twitter.images = [image.startsWith('http') ? image : `${siteUrl}${image}`];
    }
  }
  
  if (url && metadata.openGraph) {
    metadata.openGraph.url = url.startsWith('http') ? url : `${siteUrl}${url}`;
    if (metadata.alternates) {
      metadata.alternates.canonical = url.startsWith('http') ? url : `${siteUrl}${url}`;
    }
  }
  
  return metadata;
} 