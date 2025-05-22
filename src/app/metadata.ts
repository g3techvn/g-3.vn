import type { Metadata } from 'next';

// Base URL
const siteUrl = 'https://g-3.vn';

// Default metadata
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: '%s | G3 - Công Thái Học',
    default: 'G3 - Công Thái Học',
  },
  description: 'Cung cấp sản phẩm nội thất văn phòng với thiết kế công thái học chất lượng cao',
  keywords: ['công thái học', 'nội thất văn phòng', 'ghế ergonomic', 'bàn điều chỉnh độ cao'],
  authors: [{ name: 'G3', url: siteUrl }],
  creator: 'G3',
  publisher: 'G3',
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
    title: 'G3 - Công Thái Học',
    description: 'Cung cấp sản phẩm nội thất văn phòng với thiết kế công thái học chất lượng cao',
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 800,
        height: 600,
        alt: 'G3 Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'G3 - Công Thái Học',
    description: 'Cung cấp sản phẩm nội thất văn phòng với thiết kế công thái học chất lượng cao',
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