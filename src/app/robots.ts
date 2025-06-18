import { MetadataRoute } from 'next';
import { COMPANY_INFO } from '@/constants';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = COMPANY_INFO.website;
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/*?*utm_*',
          '/*?*ref=*',
          '/search?*',
          '/gio-hang',
          '/tai-khoan',
          '/checkout',
          '/thanh-toan',
        ],
      },
      {
        userAgent: ['Googlebot', 'Bingbot'],
        allow: '/',
        disallow: [
          '/api/',
          '/admin/', 
          '/private/',
          '/gio-hang',
          '/tai-khoan',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
} 