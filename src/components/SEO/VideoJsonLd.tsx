'use client';

import Script from 'next/script';

interface VideoJsonLdProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string; // ISO 8601 duration format (e.g., "PT2M30S")
  contentUrl?: string;
  embedUrl?: string;
  width?: number;
  height?: number;
  publisher?: {
    name: string;
    logo?: string;
    url?: string;
  };
  creator?: {
    name: string;
    url?: string;
  };
  interactionStatistic?: {
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
  };
  keywords?: string[];
  category?: string;
  productContext?: {
    name: string;
    brand: string;
    price: string;
    currency: string;
    availability: string;
    url: string;
  };
}

export default function VideoJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
  width = 1280,
  height = 720,
  publisher = {
    name: 'G3 - Công Thái Học',
    logo: 'https://g-3.vn/logo.png',
    url: 'https://g-3.vn',
  },
  creator,
  interactionStatistic,
  keywords,
  category,
  productContext,
}: VideoJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl: [thumbnailUrl],
    uploadDate,
    ...(duration && { duration }),
    ...(contentUrl && { contentUrl }),
    ...(embedUrl && { embedUrl }),
    width,
    height,
    publisher: {
      '@type': 'Organization',
      name: publisher.name,
      ...(publisher.logo && {
        logo: {
          '@type': 'ImageObject',
          url: publisher.logo,
        },
      }),
      ...(publisher.url && { url: publisher.url }),
    },
    ...(creator && {
      creator: {
        '@type': 'Person',
        name: creator.name,
        ...(creator.url && { url: creator.url }),
      },
    }),
    ...(interactionStatistic && {
      interactionStatistic: [
        ...(interactionStatistic.viewCount
          ? [
              {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/WatchAction',
                userInteractionCount: interactionStatistic.viewCount,
              },
            ]
          : []),
        ...(interactionStatistic.likeCount
          ? [
              {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/LikeAction',
                userInteractionCount: interactionStatistic.likeCount,
              },
            ]
          : []),
        ...(interactionStatistic.commentCount
          ? [
              {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/CommentAction',
                userInteractionCount: interactionStatistic.commentCount,
              },
            ]
          : []),
      ],
    }),
    ...(keywords && { keywords: keywords.join(', ') }),
    ...(category && { genre: category }),
    ...(productContext && {
      about: {
        '@type': 'Product',
        name: productContext.name,
        brand: {
          '@type': 'Brand',
          name: productContext.brand,
        },
        offers: {
          '@type': 'Offer',
          price: productContext.price,
          priceCurrency: productContext.currency,
          availability: `https://schema.org/${productContext.availability}`,
          url: productContext.url,
        },
      },
    }),
  };

  return (
    <Script
      id="video-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
} 