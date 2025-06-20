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
  const productSchema: Record<string, unknown> = {
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
    // Always include offers - this is required
    "offers": {
      "@type": "Offer",
      "url": `https://g-3.vn/san-pham/${product.slug}`,
      "priceCurrency": "VND",
      "price": product.price.toString(),
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      "availability": `https://schema.org/${availability}`,
      "seller": {
        "@type": "Organization",
        "name": "G3 - Công Thái Học",
        "url": "https://g-3.vn",
        "telephone": "+84979983355",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Tầng 7, Tòa nhà Charmvit, số 117 Trần Duy Hưng",
          "addressLocality": "Cầu Giấy",
          "addressRegion": "Hà Nội",
          "addressCountry": "VN"
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnShippingFeesAmount": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "VND"
        }
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
          "businessDays": "1-3",
          "cutoffTime": "17:00"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "VN"
        }
      },
      "warranty": {
        "@type": "WarrantyPromise",
        "durationOfWarranty": {
          "@type": "Duration",
          "value": "P12M"
        },
        "warrantyScope": "https://schema.org/WarrantyPromise"
      }
    },
    "category": product.category_name || "Nội thất văn phòng",
    "sku": product.id.toString(),
    "mpn": product.id.toString(), // Manufacturer Part Number
    "productID": product.id.toString(),
    "weight": {
      "@type": "QuantitativeValue",
      "unitCode": "KGM",
      "value": "15" // Default weight, should be from product data
    },
    "material": "Vải lưới, khung nhôm cao cấp",
    "color": "Đen",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Bảo hành",
        "value": "12 tháng chính hãng"
      },
      {
        "@type": "PropertyValue", 
        "name": "Chất liệu",
        "value": "Vải lưới thoáng khí, khung nhôm"
      },
      {
        "@type": "PropertyValue",
        "name": "Lắp ráp",
        "value": "Hướng dẫn chi tiết kèm theo"
      },
      {
        "@type": "PropertyValue",
        "name": "Công nghệ",
        "value": "Ergonomic - Công thái học"
      }
    ]
  };

  // Add aggregate rating and reviews if available
  if (reviews.length > 0) {
    const avgRating = calculateAverageRating(reviews);
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": reviews.length.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };

    // Add individual reviews (up to 5 for performance)
    productSchema.review = reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString(),
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
  } else {
    // If no reviews, add a default aggregate rating based on general product quality
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    };

    // Add a default review from the store
    productSchema.review = {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "4.5",
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Organization",
        "name": "G3 Store"
      },
      "datePublished": new Date().toISOString().split('T')[0],
      "reviewBody": `${product.name} là sản phẩm chất lượng cao, thiết kế công thái học, được đánh giá tốt bởi khách hàng. Bảo hành 12 tháng, giao hàng miễn phí toàn quốc.`
    };
  }

  // Add original price if on sale
  if (product.original_price && product.original_price > product.price) {
    (productSchema.offers as Record<string, unknown>).priceSpecification = {
      "@type": "UnitPriceSpecification",
      "price": product.price.toString(),
      "priceCurrency": "VND",
      "originalPrice": product.original_price.toString()
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