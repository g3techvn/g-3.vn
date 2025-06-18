'use client';

import { COMPANY_INFO, SOCIAL_LINKS } from '@/constants';

interface LocalBusinessJsonLdProps {
  includeReviews?: boolean;
}

export function LocalBusinessJsonLd({ includeReviews = true }: LocalBusinessJsonLdProps) {
  const businessSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${COMPANY_INFO.website}#localbusiness`,
    "name": COMPANY_INFO.name,
    "alternateName": "G3 Việt Nam",
    "description": "Chuyên cung cấp nội thất văn phòng với thiết kế công thái học chất lượng cao. Bảo hành 12 tháng, miễn phí giao hàng toàn quốc.",
    "url": COMPANY_INFO.website,
    "telephone": COMPANY_INFO.hotline,
    "email": COMPANY_INFO.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tầng 7, Tòa nhà Charmvit, số 117 Trần Duy Hưng",
      "addressLocality": "Quận Cầu Giấy",
      "addressRegion": "Hà Nội",
      "addressCountry": "VN",
      "postalCode": "100000"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "21.0285",
      "longitude": "105.8542"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday", 
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "08:00",
        "closes": "17:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "16:00"
      }
    ],
    "logo": `${COMPANY_INFO.website}/logo.png`,
    "image": [
      `${COMPANY_INFO.website}/logo.png`,
      `${COMPANY_INFO.website}/images/section-1.jpeg`,
      `${COMPANY_INFO.website}/images/section-2.jpeg`
    ],
    "priceRange": "₫₫",
    "currenciesAccepted": "VND",
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer", "ZaloPay", "QR Code"],
    "areaServed": {
      "@type": "Country",
      "name": "Vietnam"
    },
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "21.0285",
        "longitude": "105.8542"
      },
      "geoRadius": "1000000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Nội thất văn phòng công thái học",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Ghế văn phòng",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Ghế ergonomic"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog", 
          "name": "Bàn làm việc",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product", 
                "name": "Bàn điều chỉnh độ cao"
              }
            }
          ]
        }
      ]
    },
    "sameAs": SOCIAL_LINKS.map(link => link.href),
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": COMPANY_INFO.hotline,
        "contactType": "customer service",
        "areaServed": "VN",
        "availableLanguage": ["Vietnamese"]
      },
      {
        "@type": "ContactPoint",
        "email": COMPANY_INFO.email,
        "contactType": "customer support",
        "areaServed": "VN", 
        "availableLanguage": ["Vietnamese"]
      }
    ],
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Tư vấn nội thất văn phòng"
        },
        "price": "0",
        "priceCurrency": "VND"
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Giao hàng miễn phí"
        },
        "price": "0",
        "priceCurrency": "VND",
        "eligibleQuantity": {
          "@type": "QuantitativeValue",
          "minValue": 500000,
          "unitCode": "VND"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Bảo hành 12 tháng"
        },
        "warranty": {
          "@type": "WarrantyPromise",
          "durationOfWarranty": "P12M"
        }
      }
    ]
  };

  // Add aggregate rating if reviews are included
  if (includeReviews) {
    businessSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    };

    businessSchema.review = [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Nguyễn Văn A"
        },
        "datePublished": "2024-01-15",
        "reviewBody": "Sản phẩm chất lượng tốt, giao hàng nhanh, nhân viên tư vấn nhiệt tình. Ghế ngồi rất êm, phù hợp làm việc lâu.",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        }
      },
      {
        "@type": "Review", 
        "author": {
          "@type": "Person",
          "name": "Trần Thị B"
        },
        "datePublished": "2024-01-10",
        "reviewBody": "Dịch vụ chuyên nghiệp, sản phẩm đúng như mô tả. Bảo hành tốt, có hỗ trợ kỹ thuật.",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5", 
          "bestRating": "5"
        }
      }
    ];
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ 
        __html: JSON.stringify(businessSchema, null, 2) 
      }}
    />
  );
} 