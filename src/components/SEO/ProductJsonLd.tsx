'use client';

import { Product, Brand } from '@/types';

interface Review {
  id: string;
  rating: number;
  author: string;
  datePublished: string;
  reviewBody: string;
}

interface ProductJsonLdProps {
  product: Product;
  reviews?: Review[];
  brand?: Brand;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder';
}

export function ProductJsonLd({ 
  product, 
  reviews = [], 
  brand, 
  availability = 'InStock' 
}: ProductJsonLdProps) {
  // Calculate average rating if reviews exist
  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Generate product schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - Sản phẩm công thái học chất lượng cao từ G3`,
    "image": [
      product.image_url,
      product.image_square_url || product.image_url
    ].filter(Boolean),
    "brand": {
      "@type": "Brand",
      "name": brand?.title || "G3"
    },
    "manufacturer": {
      "@type": "Organization", 
      "name": "G3 - Công Thái Học"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://g-3.vn/san-pham/${product.slug}`,
      "priceCurrency": "VND",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      "availability": `https://schema.org/${availability}`,
      "seller": {
        "@type": "Organization",
        "name": "G3 - Công Thái Học",
        "url": "https://g-3.vn"
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 30,
        "returnMethod": "https://schema.org/ReturnByMail"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "VND"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "minValue": 1,
          "maxValue": 3,
          "unitCode": "DAY"
        }
      }
    },
    "category": product.category_name || "Nội thất văn phòng",
    "sku": product.id,
    "gtin": product.id, // Use product ID as GTIN for now
    "weight": {
      "@type": "QuantitativeValue",
      "unitCode": "KGM",
      "value": 15 // Default weight, should be from product data
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Warranty",
        "value": "12 tháng"
      },
      {
        "@type": "PropertyValue", 
        "name": "Material",
        "value": "Vải lưới, khung nhôm"
      },
      {
        "@type": "PropertyValue",
        "name": "Assembly Required",
        "value": "Yes"
      }
    ]
  };

  // Add aggregate rating if reviews exist
  if (reviews.length > 0) {
    const avgRating = calculateAverageRating(reviews);
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };

    // Add individual reviews
    productSchema.review = reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.datePublished,
      "reviewBody": review.reviewBody
    }));
  }

  // Add original price if on sale
  if (product.original_price && product.original_price > product.price) {
    productSchema.offers.priceSpecification = {
      "@type": "UnitPriceSpecification",
      "price": product.price,
      "priceCurrency": "VND",
      "originalPrice": product.original_price
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ 
        __html: JSON.stringify(productSchema, null, 2) 
      }}
    />
  );
} 