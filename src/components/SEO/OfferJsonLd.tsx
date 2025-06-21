'use client';

import Script from 'next/script';

interface OfferJsonLdProps {
  type?: 'Offer' | 'AggregateOffer';
  name: string;
  description?: string;
  price: string;
  priceCurrency: string;
  priceValidUntil?: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder' | 'Discontinued';
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition' | 'DamagedCondition';
  url?: string;
  image?: string;
  seller: {
    name: string;
    url?: string;
    logo?: string;
    telephone?: string;
    email?: string;
    address?: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  };
  itemOffered: {
    name: string;
    description?: string;
    image?: string;
    brand?: string;
    model?: string;
    sku?: string;
    gtin?: string;
    category?: string;
  };
  validFrom?: string;
  validThrough?: string;
  eligibleRegion?: string;
  ineligibleRegion?: string;
  priceSpecification?: {
    minPrice?: string;
    maxPrice?: string;
    valueAddedTaxIncluded?: boolean;
  };
  shippingDetails?: {
    shippingRate: string;
    shippingDestination: string;
    deliveryTime?: string;
  };
  warranty?: {
    durationOfWarranty: string;
    warrantyScope?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export default function OfferJsonLd({
  type = 'Offer',
  name,
  description,
  price,
  priceCurrency,
  priceValidUntil,
  availability,
  condition = 'NewCondition',
  url,
  image,
  seller,
  itemOffered,
  validFrom,
  validThrough,
  eligibleRegion,
  ineligibleRegion,
  priceSpecification,
  shippingDetails,
  warranty,
  aggregateRating,
}: OfferJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    ...(description && { description }),
    price,
    priceCurrency,
    ...(priceValidUntil && { priceValidUntil }),
    availability: `https://schema.org/${availability}`,
    itemCondition: `https://schema.org/${condition}`,
    ...(url && { url }),
    ...(image && { image }),
    seller: {
      '@type': 'Organization',
      name: seller.name,
      ...(seller.url && { url: seller.url }),
      ...(seller.logo && {
        logo: {
          '@type': 'ImageObject',
          url: seller.logo,
        },
      }),
      ...(seller.telephone && { telephone: seller.telephone }),
      ...(seller.email && { email: seller.email }),
      ...(seller.address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: seller.address.streetAddress,
          addressLocality: seller.address.addressLocality,
          addressRegion: seller.address.addressRegion,
          postalCode: seller.address.postalCode,
          addressCountry: seller.address.addressCountry,
        },
      }),
    },
    itemOffered: {
      '@type': 'Product',
      name: itemOffered.name,
      ...(itemOffered.description && { description: itemOffered.description }),
      ...(itemOffered.image && { image: itemOffered.image }),
      ...(itemOffered.brand && {
        brand: {
          '@type': 'Brand',
          name: itemOffered.brand,
        },
      }),
      ...(itemOffered.model && { model: itemOffered.model }),
      ...(itemOffered.sku && { sku: itemOffered.sku }),
      ...(itemOffered.gtin && { gtin: itemOffered.gtin }),
      ...(itemOffered.category && { category: itemOffered.category }),
    },
    ...(validFrom && { validFrom }),
    ...(validThrough && { validThrough }),
    ...(eligibleRegion && { eligibleRegion }),
    ...(ineligibleRegion && { ineligibleRegion }),
    ...(priceSpecification && {
      priceSpecification: {
        '@type': 'PriceSpecification',
        ...(priceSpecification.minPrice && { minPrice: priceSpecification.minPrice }),
        ...(priceSpecification.maxPrice && { maxPrice: priceSpecification.maxPrice }),
        ...(priceSpecification.valueAddedTaxIncluded !== undefined && {
          valueAddedTaxIncluded: priceSpecification.valueAddedTaxIncluded,
        }),
        priceCurrency,
      },
    }),
    ...(shippingDetails && {
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: shippingDetails.shippingRate,
          currency: priceCurrency,
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: shippingDetails.shippingDestination,
        },
        ...(shippingDetails.deliveryTime && {
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: shippingDetails.deliveryTime,
          },
        }),
      },
    }),
    ...(warranty && {
      warranty: {
        '@type': 'WarrantyPromise',
        durationOfWarranty: warranty.durationOfWarranty,
        ...(warranty.warrantyScope && { warrantyScope: warranty.warrantyScope }),
      },
    }),
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
      id="offer-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 2),
      }}
    />
  );
} 