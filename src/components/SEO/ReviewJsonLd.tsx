'use client';

import Script from 'next/script';

interface Review {
  id: string;
  author: {
    name: string;
    image?: string;
  };
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviewBody: string;
  datePublished: string;
  publisher?: {
    name: string;
    url?: string;
  };
}

interface ReviewJsonLdProps {
  reviews: Review[];
  itemReviewed: {
    name: string;
    image?: string;
    url?: string;
    brand?: string;
    sku?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export default function ReviewJsonLd({
  reviews,
  itemReviewed,
  aggregateRating,
}: ReviewJsonLdProps) {
  const reviewsSchema = reviews.map((review) => ({
    '@type': 'Review',
    '@id': `#review-${review.id}`,
    author: {
      '@type': 'Person',
      name: review.author.name,
      ...(review.author.image && { image: review.author.image }),
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.reviewRating.ratingValue,
      bestRating: review.reviewRating.bestRating || 5,
      worstRating: review.reviewRating.worstRating || 1,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
    ...(review.publisher && {
      publisher: {
        '@type': 'Organization',
        name: review.publisher.name,
        ...(review.publisher.url && { url: review.publisher.url }),
      },
    }),
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: itemReviewed.name,
    ...(itemReviewed.image && { image: itemReviewed.image }),
    ...(itemReviewed.url && { url: itemReviewed.url }),
    ...(itemReviewed.brand && {
      brand: {
        '@type': 'Brand',
        name: itemReviewed.brand,
      },
    }),
    ...(itemReviewed.sku && { sku: itemReviewed.sku }),
    review: reviewsSchema,
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating || 5,
        worstRating: aggregateRating.worstRating || 1,
      },
    }),
  };

  return (
    <Script
      id="review-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
} 