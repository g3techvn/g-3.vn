import { COMPANY_INFO } from '@/constants';

interface SocialMetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: string;
  availability?: string;
  brand?: string;
  category?: string;
}

export function SocialMetaTags({
  title = 'G3 - Công Thái Học - Nội thất văn phòng với thiết kế công thái học',
  description = `${COMPANY_INFO.name} - Chuyên cung cấp nội thất văn phòng với thiết kế công thái học chất lượng cao. ✓ Bảo hành 12 tháng ✓ Miễn phí giao hàng ✓ Tư vấn 24/7`,
  image = `${COMPANY_INFO.website}/images/header-img.jpg`,
  url = COMPANY_INFO.website,
  type = 'website',
  price,
  availability,
  brand,
  category,
}: SocialMetaTagsProps) {
  return (
    <>
      {/* Zalo specific meta tags */}
      <meta property="zalo:app_id" content={process.env.NEXT_PUBLIC_ZALO_APP_ID || ''} />
      <meta property="zalo:title" content={title} />
      <meta property="zalo:description" content={description} />
      <meta property="zalo:image" content={image} />
      <meta property="zalo:url" content={url} />
      <meta property="zalo:type" content={type} />
      
      {/* Facebook specific meta tags */}
      <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''} />
      <meta property="fb:admins" content={process.env.NEXT_PUBLIC_FACEBOOK_ADMIN_ID || ''} />
      
      {/* Additional Open Graph tags for better social sharing */}
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:rich_attachment" content="true" />
      <meta property="og:updated_time" content={new Date().toISOString()} />
      <meta property="og:see_also" content={`${COMPANY_INFO.website}/san-pham`} />
      <meta property="og:see_also" content={`${COMPANY_INFO.website}/categories`} />
      
      {/* WhatsApp Business specific */}
      <meta property="whatsapp:title" content={title} />
      <meta property="whatsapp:description" content={description} />
      <meta property="whatsapp:image" content={image} />
      
      {/* Telegram specific */}
      <meta property="telegram:channel" content="@g3vietnam" />
      
      {/* Business contact info for rich snippets */}
      <meta name="contact:phone_number" content={COMPANY_INFO.hotline} />
      <meta name="contact:email" content={COMPANY_INFO.email} />
      <meta name="contact:street_address" content={COMPANY_INFO.address} />
      <meta name="contact:locality" content="Hà Nội" />
      <meta name="contact:region" content="Hà Nội" />
      <meta name="contact:postal_code" content="100000" />
      <meta name="contact:country" content="Vietnam" />
      
      {/* Product specific meta tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content="VND" />
        </>
      )}
      {type === 'product' && availability && (
        <meta property="product:availability" content={availability} />
      )}
      {type === 'product' && brand && (
        <meta property="product:brand" content={brand} />
      )}
      {type === 'product' && category && (
        <meta property="product:category" content={category} />
      )}
      
      {/* Mobile app meta tags */}
      <meta name="apple-mobile-web-app-title" content="G3 Store" />
      <meta name="application-name" content="G3 Store" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content={`${COMPANY_INFO.website}/icons/ms-icon-144x144.png`} />
      <meta name="theme-color" content="#ffffff" />
      
      {/* Search engine verification */}
      <meta name="zalo-site-verification" content={process.env.NEXT_PUBLIC_ZALO_VERIFICATION || ''} />
      <meta name="facebook-domain-verification" content={process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION || ''} />
      
      {/* Structured data for social sharing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": description,
            "url": url,
            "image": image,
            "publisher": {
              "@type": "Organization",
              "name": COMPANY_INFO.name,
              "url": COMPANY_INFO.website,
              "logo": `${COMPANY_INFO.website}/logo.png`,
              "telephone": COMPANY_INFO.hotline,
              "email": COMPANY_INFO.email,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": COMPANY_INFO.address,
                "addressLocality": "Hà Nội",
                "addressCountry": "VN"
              }
            },
            "mainEntity": {
              "@type": type === 'product' ? "Product" : "WebPage",
              "name": title,
              "description": description,
              "image": image,
              ...(type === 'product' && price && {
                "offers": {
                  "@type": "Offer",
                  "price": price,
                  "priceCurrency": "VND",
                  "availability": availability || "https://schema.org/InStock",
                  "seller": {
                    "@type": "Organization",
                    "name": COMPANY_INFO.name
                  }
                }
              })
            }
          })
        }}
      />
    </>
  );
} 