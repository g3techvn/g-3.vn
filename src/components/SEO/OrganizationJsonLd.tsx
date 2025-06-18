'use client';

interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
}

interface SocialLinks {
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  instagram?: string;
}

interface OrganizationJsonLdProps {
  contact?: ContactInfo;
  social?: SocialLinks;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

export function OrganizationJsonLd({ 
  contact = {},
  social = {},
  location = {}
}: OrganizationJsonLdProps = {}) {
  
  const organizationSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "G3 - Công Thái Học",
    "alternateName": "G3 Tech",
    "url": "https://g-3.vn",
    "logo": "https://g-3.vn/logo.png",
    "image": "https://g-3.vn/logo.png",
    "description": "Cung cấp sản phẩm nội thất văn phòng với thiết kế công thái học chất lượng cao, giúp cải thiện sức khỏe và năng suất làm việc.",
    "foundingDate": "2020",
    "slogan": "Chăm sóc sức khỏe - Nâng cao năng suất",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "VN",
      "addressRegion": contact.address || "TP. Hồ Chí Minh",
      "addressLocality": "TP. Hồ Chí Minh",
      "streetAddress": location.address || "Địa chỉ cửa hàng G3"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": contact.phone || "+84-xxx-xxx-xxx",
        "contactType": "customer service",
        "availableLanguage": ["Vietnamese"],
        "areaServed": "VN"
      },
      {
        "@type": "ContactPoint",
        "email": contact.email || "info@g-3.vn",
        "contactType": "customer support",
        "availableLanguage": ["Vietnamese"]
      }
    ],
    "sameAs": Object.values(social).filter(Boolean),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Sản phẩm công thái học",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Ghế công thái học",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Ghế công thái học",
                "category": "Furniture > Office Furniture > Office Chairs"
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
                "name": "Bàn điều chỉnh độ cao",
                "category": "Furniture > Office Furniture > Office Desks"
              }
            }
          ]
        }
      ]
    },
    "knowsAbout": [
      "Ergonomic furniture",
      "Office furniture", 
      "Health and wellness",
      "Workplace productivity",
      "Furniture design"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "Vietnam"
    },
    "currenciesAccepted": "VND",
    "paymentAccepted": [
      "Cash", 
      "Credit Card",
      "Bank Transfer", 
      "COD"
    ],
    "priceRange": "$$"
  };

  // Add location data if provided
  if (location.latitude && location.longitude) {
    organizationSchema.geo = {
      "@type": "GeoCoordinates",
      "latitude": location.latitude,
      "longitude": location.longitude
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ 
        __html: JSON.stringify(organizationSchema, null, 2) 
      }}
    />
  );
} 